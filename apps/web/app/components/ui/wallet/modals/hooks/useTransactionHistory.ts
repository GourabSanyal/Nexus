import { useState, useEffect, useCallback, useRef, useMemo, useReducer } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  NetworkEnum,
  ChainEnum,
  NetworkConnectionEnum,
  selectWalletById,
} from "@my-org/store";
import {
  transactionHistoryState,
  transactionHistoryLoadingState,
} from "@repo/store/src/atoms/transactionHistoryState";
import { walletState } from "@my-org/store";
import { TransactionInfo } from "@api-types/TransactionTypes";
import { toast } from "sonner";
import { WalletAdapterFactory } from "@/app/lib/adapters/WalletAdapterFactory";
import { useNetworkManager } from "@/app/hooks/useNetworkManager";
import { IWalletAdapter } from "@/app/lib/adapters/IWalletAdapter";
import {
  historyCacheKey,
  hasCachedTransactions,
  hasHistoryChanged,
  readCachedTransactions,
} from "../utils/transactionHistoryCache";
import {
  fetchWalletTransactionHistory,
  getInFlightTransactionHistoryFetch,
  getLatestTransactions,
} from "@/app/lib/services/transactionHistoryFetch";

interface UseTransactionHistoryProps {
  walletId: number;
  isOpen: boolean;
  onRefreshBalance?: () => void;
}

const getFetchErrorMessage = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "";
};

export const useTransactionHistory = ({
  walletId,
  isOpen,
  onRefreshBalance,
}: UseTransactionHistoryProps) => {
  const walletStateValue = useRecoilValue(walletState);
  const transactionHistory = useRecoilValue(transactionHistoryState);
  const setTransactionHistory = useSetRecoilState(transactionHistoryState);
  const loadingStates = useRecoilValue(transactionHistoryLoadingState);
  const setLoadingStates = useSetRecoilState(transactionHistoryLoadingState);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchVersion, incrementFetchVersion] = useReducer((x) => x + 1, 0);
  const prevLoadingRef = useRef<boolean>(false);

  const wallet = selectWalletById(walletStateValue, walletId);

  const adapter: IWalletAdapter | null = useMemo(() => {
    return wallet ? WalletAdapterFactory.create(wallet.type) : null;
  }, [wallet?.type]);

  const chain = adapter?.chain || ChainEnum.Solana;

  const networkManager = useNetworkManager(adapter, chain, walletId);

  const currentCluster =
    networkManager.currentNetwork ||
    adapter?.getDefaultNetwork() ||
    NetworkEnum.Mainnet;

  const cacheKey = historyCacheKey(walletId, currentCluster);
  const isCurrentlyLoading = loadingStates[cacheKey] || false;

  // Bump version when loading transitions from true→false (fetch completed).
  // This ensures useMemo re-computes with fresh module cache data.
  useEffect(() => {
    if (prevLoadingRef.current && !isCurrentlyLoading && isOpen) {
      incrementFetchVersion();
    }
    prevLoadingRef.current = isCurrentlyLoading;
  }, [isCurrentlyLoading, isOpen]);

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

  const fetchTransactions = useCallback(
    async (
      cluster: NetworkEnum,
      options: { forceRefresh?: boolean; refreshBalanceOnChange?: boolean } = {}
    ) => {
      const { forceRefresh = false, refreshBalanceOnChange = false } = options;

      const currentWallet = walletRef.current;
      const currentAdapter = adapterRef.current;
      if (!currentWallet || !currentAdapter) {
        setIsRefreshing(false);
        return;
      }

      const cachedData = readCachedTransactions(
        transactionHistoryRef.current,
        walletId,
        cluster
      );

      if (!forceRefresh && hasCachedTransactions(cachedData)) {
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

        const historyChanged = hasHistoryChanged(
          cachedData,
          fetchedTransactions
        );

        if (
          refreshBalanceOnChange &&
          historyChanged &&
          onRefreshBalanceRef.current
        ) {
          onRefreshBalanceRef.current();
        }
      } catch (error: unknown) {
        console.error("Error fetching transactions:", error);
        const message = getFetchErrorMessage(error);
        if (message.includes(NetworkConnectionEnum.NoInternet)) {
          toast.warning(
            "Failed to fetch transactions. Please check your internet connection."
          );
        } else {
          toast.error("Failed to fetch transactions. Please try again.");
        }
      } finally {
        setIsRefreshing(false);
      }
    },
    [walletId, setTransactionHistory, setLoadingStates]
  );

  const fetchTransactionsRef = useRef(fetchTransactions);
  useEffect(() => {
    fetchTransactionsRef.current = fetchTransactions;
  }, [fetchTransactions]);

  // On open: join in-flight header fetch or load if no cache.
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
        return;
      }

      const cachedData = readCachedTransactions(
        transactionHistoryRef.current,
        walletId,
        cluster
      );
      if (!hasCachedTransactions(cachedData)) {
        await fetchTransactionsRef.current(cluster, {
          forceRefresh: true,
          refreshBalanceOnChange: false,
        });
      }
    };

    void runOnOpen();
  }, [isOpen, walletId, wallet, adapter, currentCluster]);

  // Derive transactions: prefer module-level cache (instant), fall back to Recoil.
  // Re-compute when fetchVersion bumps (any fetch completes) or Recoil state updates.
  const currentTransactions = useMemo((): TransactionInfo[] => {
    const fromModuleCache = getLatestTransactions(walletId, currentCluster);
    if (fromModuleCache) {
      return fromModuleCache;
    }
    return readCachedTransactions(transactionHistory, walletId, currentCluster);
  }, [transactionHistory, walletId, currentCluster, fetchVersion]);

  const hasCachedList = useMemo(
    () => hasCachedTransactions(currentTransactions),
    [currentTransactions]
  );

  const loading = useMemo((): boolean => {
    return loadingStates[cacheKey] || false;
  }, [loadingStates, cacheKey]);

  const handleClusterToggle = useCallback(() => {
    networkManager.toggle();
  }, [networkManager]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchTransactionsRef.current(currentCluster, {
      forceRefresh: true,
      refreshBalanceOnChange: true,
    });
  }, [currentCluster]);

  return {
    wallet,
    currentCluster,
    currentTransactions,
    loading,
    isRefreshing,
    hasCachedList,
    handleClusterToggle,
    handleRefresh,
  };
};
