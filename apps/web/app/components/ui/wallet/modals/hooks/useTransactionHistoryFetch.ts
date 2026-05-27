import { useState, useEffect, useCallback, useRef, useReducer } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { NetworkEnum } from "@my-org/store";
import {
  transactionHistoryState,
  transactionHistoryLoadingState,
} from "@repo/store/src/atoms/transactionHistoryState";
import { TransactionHistoryStore } from "@api-types/TransactionTypes";
import {
  hasCachedTransactions,
  hasHistoryChanged,
  historyCacheKey,
  readCachedTransactions,
} from "../utils/transactionHistoryCache";
import {
  fetchWalletTransactionHistory,
  getInFlightTransactionHistoryFetch,
  subscribeTransactionHistoryUpdated,
  hasMoreTransactions,
} from "@/app/lib/services/transactionHistoryFetch";
import { showTransactionFetchError } from "./transactionHistoryResolve";
import { useLoadMoreTransactions } from "./useLoadMoreTransactions";
import type {
  FetchOptions,
  UseTransactionHistoryFetchParams,
  TransactionHistoryFetchResult,
} from "@/app/types/components/UseTransactionHistoryFetchTypes";

const shouldSkipFetch = (
  history: TransactionHistoryStore,
  walletId: number,
  cluster: NetworkEnum,
  forceRefresh: boolean
): boolean => {
  if (forceRefresh) return false;
  return hasCachedTransactions(readCachedTransactions(history, walletId, cluster));
};

export const useTransactionHistoryFetch = ({
  walletId,
  isOpen,
  currentCluster,
  wallet,
  adapter,
  onRefreshBalance,
}: UseTransactionHistoryFetchParams): TransactionHistoryFetchResult => {
  const transactionHistory = useRecoilValue(transactionHistoryState);
  const loadingStates = useRecoilValue(transactionHistoryLoadingState);
  const setTransactionHistory = useSetRecoilState(transactionHistoryState);
  const setLoadingStates = useSetRecoilState(transactionHistoryLoadingState);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchVersion, incrementFetchVersion] = useReducer((x) => x + 1, 0);

  const cacheKey = historyCacheKey(walletId, currentCluster);
  const loadMoreKey = `${cacheKey}:loadMore`;
  const isCurrentlyLoading = loadingStates[cacheKey] || false;
  const isCurrentlyLoadingMore = loadingStates[loadMoreKey] || false;
  const canLoadMore = hasMoreTransactions(walletId, currentCluster);

  const transactionHistoryRef = useRef(transactionHistory);
  const walletRef = useRef(wallet);
  const adapterRef = useRef(adapter);
  const onRefreshBalanceRef = useRef(onRefreshBalance);
  const prevLoadingRef = useRef(false);

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

      const currentHistory = transactionHistoryRef.current as TransactionHistoryStore;
      if (shouldSkipFetch(currentHistory, walletId, cluster, forceRefresh)) return;

      const cached = readCachedTransactions(currentHistory, walletId, cluster);
      try {
        const fetched = await fetchWalletTransactionHistory({
          walletId,
          publicKey: currentWallet.publicKey,
          cluster,
          adapter: currentAdapter,
          setTransactionHistory,
          setLoadingStates,
          currentHistory,
        });
        if (
          refreshBalanceOnChange &&
          hasHistoryChanged(cached, fetched) &&
          onRefreshBalanceRef.current
        ) {
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
    return subscribeTransactionHistoryUpdated(walletId, currentCluster, () =>
      incrementFetchVersion()
    );
  }, [isOpen, walletId, currentCluster]);

  useEffect(() => {
    if (!isOpen || !wallet || !adapter) return;

    const cluster = currentCluster;
    void (async () => {
      const inFlight = getInFlightTransactionHistoryFetch(walletId, cluster);
      if (inFlight) {
        try {
          await inFlight;
        } catch {
          // errors surfaced by originating fetch
        }
        incrementFetchVersion();
        return;
      }
      const cached = readCachedTransactions(
        transactionHistoryRef.current as TransactionHistoryStore,
        walletId,
        cluster
      );
      if (!hasCachedTransactions(cached)) {
        await runFetchRef.current(cluster, {
          forceRefresh: true,
          refreshBalanceOnChange: true,
        });
      }
    })();
  }, [isOpen, walletId, wallet, adapter, currentCluster]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await runFetchRef.current(currentCluster, {
      forceRefresh: true,
      refreshBalanceOnChange: true,
    });
  }, [currentCluster]);

  const { isLoadingMore, handleLoadMore } = useLoadMoreTransactions({
    walletId,
    currentCluster,
    walletRef,
    adapterRef,
    historyRef: transactionHistoryRef,
    onSuccess: incrementFetchVersion,
    onRefreshBalance: onRefreshBalanceRef,
  });

  return {
    isRefreshing,
    isLoadingMore: isLoadingMore || isCurrentlyLoadingMore,
    canLoadMore,
    fetchVersion,
    handleRefresh,
    handleLoadMore,
  };
};
