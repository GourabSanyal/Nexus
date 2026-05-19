import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useReducer,
} from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { NetworkEnum } from "@my-org/store";
import {
  transactionHistoryState,
  transactionHistoryLoadingState,
} from "@repo/store/src/atoms/transactionHistoryState";
import { IWalletAdapter } from "@/app/lib/adapters/IWalletAdapter";
import type { EthereumWallet, SolanaWallet } from "@my-org/zod";
import {
  hasCachedTransactions,
  hasHistoryChanged,
  historyCacheKey,
  readCachedTransactions,
  TransactionHistoryStore,
} from "../utils/transactionHistoryCache";
import {
  fetchWalletTransactionHistory,
  getInFlightTransactionHistoryFetch,
  subscribeTransactionHistoryUpdated,
} from "@/app/lib/services/transactionHistoryFetch";
import { showTransactionFetchError } from "./transactionHistoryResolve";

type WalletRef = SolanaWallet | EthereumWallet | undefined;

type FetchOptions = {
  forceRefresh?: boolean;
  refreshBalanceOnChange?: boolean;
};

type UseTransactionHistoryFetchParams = {
  walletId: number;
  isOpen: boolean;
  currentCluster: NetworkEnum;
  wallet: WalletRef;
  adapter: IWalletAdapter | null;
  onRefreshBalance?: () => void;
};

const shouldSkipFetch = (
  history: TransactionHistoryStore,
  walletId: number,
  cluster: NetworkEnum,
  forceRefresh: boolean
): boolean => {
  if (forceRefresh) return false;
  const cached = readCachedTransactions(history, walletId, cluster);
  return hasCachedTransactions(cached);
};

export const useTransactionHistoryFetch = ({
  walletId,
  isOpen,
  currentCluster,
  wallet,
  adapter,
  onRefreshBalance,
}: UseTransactionHistoryFetchParams) => {
  const transactionHistory = useRecoilValue(transactionHistoryState);
  const loadingStates = useRecoilValue(transactionHistoryLoadingState);
  const setTransactionHistory = useSetRecoilState(transactionHistoryState);
  const setLoadingStates = useSetRecoilState(transactionHistoryLoadingState);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchVersion, incrementFetchVersion] = useReducer((x) => x + 1, 0);
  const prevLoadingRef = useRef(false);
  const cacheKey = historyCacheKey(walletId, currentCluster);
  const isCurrentlyLoading = loadingStates[cacheKey] || false;

  const transactionHistoryRef = useRef(transactionHistory);
  const walletRef = useRef(wallet);
  const adapterRef = useRef(adapter);
  const onRefreshBalanceRef = useRef(onRefreshBalance);

  useEffect(() => {
    transactionHistoryRef.current = transactionHistory;
  }, [transactionHistory]);

  useEffect(() => {
    walletRef.current = wallet;
  }, [wallet]);

  useEffect(() => {
    adapterRef.current = adapter;
  }, [adapter]);

  useEffect(() => {
    onRefreshBalanceRef.current = onRefreshBalance;
  }, [onRefreshBalance]);

  useEffect(() => {
    if (prevLoadingRef.current && !isCurrentlyLoading && isOpen) {
      incrementFetchVersion();
    }
    prevLoadingRef.current = isCurrentlyLoading;
  }, [isCurrentlyLoading, isOpen]);

  const runFetch = useCallback(
    async (cluster: NetworkEnum, options: FetchOptions = {}) => {
      const { forceRefresh = false, refreshBalanceOnChange = false } = options;
      const currentWallet = walletRef.current;
      const currentAdapter = adapterRef.current;
      if (!currentWallet || !currentAdapter) {
        setIsRefreshing(false);
        return;
      }

      const cachedData = readCachedTransactions(
        transactionHistoryRef.current as TransactionHistoryStore,
        walletId,
        cluster
      );

      if (shouldSkipFetch(
        transactionHistoryRef.current as TransactionHistoryStore,
        walletId,
        cluster,
        forceRefresh
      )) {
        return;
      }

      try {
        const fetchedTransactions = await fetchWalletTransactionHistory({
          walletId,
          publicKey: currentWallet.publicKey,
          cluster,
          adapter: currentAdapter,
          setTransactionHistory,
          setLoadingStates,
        });

        const historyChanged = hasHistoryChanged(cachedData, fetchedTransactions);
        if (refreshBalanceOnChange && historyChanged && onRefreshBalanceRef.current) {
          onRefreshBalanceRef.current();
        }
      } catch (error: unknown) {
        showTransactionFetchError(error);
      } finally {
        setIsRefreshing(false);
      }
    },
    [walletId, setTransactionHistory, setLoadingStates]
  );

  const runFetchRef = useRef(runFetch);
  useEffect(() => {
    runFetchRef.current = runFetch;
  }, [runFetch]);

  useEffect(() => {
    if (!isOpen) return;
    return subscribeTransactionHistoryUpdated(walletId, currentCluster, () => {
      incrementFetchVersion();
    });
  }, [isOpen, walletId, currentCluster]);

  useEffect(() => {
    if (!isOpen || !wallet || !adapter) return;

    const cluster = currentCluster;

    const runOnOpen = async () => {
      const inFlight = getInFlightTransactionHistoryFetch(walletId, cluster);
      if (inFlight) {
        try {
          await inFlight;
        } catch {
          // Errors surfaced by the fetch originator.
        }
        incrementFetchVersion();
        return;
      }

      const cachedData = readCachedTransactions(
        transactionHistoryRef.current as TransactionHistoryStore,
        walletId,
        cluster
      );
      if (!hasCachedTransactions(cachedData)) {
        await runFetchRef.current(cluster, {
          forceRefresh: true,
          refreshBalanceOnChange: false,
        });
      }
    };

    void runOnOpen();
  }, [isOpen, walletId, wallet, adapter, currentCluster]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await runFetchRef.current(currentCluster, {
      forceRefresh: true,
      refreshBalanceOnChange: true,
    });
  }, [currentCluster]);

  return { isRefreshing, fetchVersion, handleRefresh };
};
