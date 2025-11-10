import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { useNetwork, NetworkEnum, ChainEnum, NetworkConnectionEnum } from "@my-org/store";
import {
  transactionHistoryState,
  transactionHistoryLoadingState,
} from "@repo/store/src/atoms/transactionHistoryState";
import { walletState } from "@my-org/store";
import { TransactionInfo } from "@api-types/TransactionTypes";
import { toast } from "sonner";

interface UseTransactionHistoryProps {
  walletId: number;
  isOpen: boolean;
}

export const useTransactionHistory = ({
  walletId,
  isOpen,
}: UseTransactionHistoryProps) => {
  const {
    getEffectiveNetwork,
    fetchAllSolTransactions,
    toggleNetwork,
  } = useNetwork();
  const walletStateValue = useRecoilValue(walletState);
  const [transactionHistory, setTransactionHistory] = useRecoilState(
    transactionHistoryState
  );
  const [loadingStates, setLoadingStates] = useRecoilState(
    transactionHistoryLoadingState
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const wallet = [
    ...(walletStateValue.solanaWallets || []),
    ...(walletStateValue.ethereumWallets || []),
  ].find((w) => w.id === walletId);

  const defaultCluster = getEffectiveNetwork(ChainEnum.Solana, walletId);
  const [currentCluster, setCurrentCluster] = useState<
    NetworkEnum.Mainnet | NetworkEnum.Devnet
  >(
    defaultCluster === NetworkEnum.Mainnet
      ? NetworkEnum.Mainnet
      : NetworkEnum.Devnet
  );

  useEffect(() => {
    if (isOpen) {
      const defaultCluster = getEffectiveNetwork(ChainEnum.Solana, walletId);
      setCurrentCluster(
        defaultCluster === NetworkEnum.Mainnet
          ? NetworkEnum.Mainnet
          : NetworkEnum.Devnet
      );
    }
  }, [isOpen, getEffectiveNetwork, walletId]);

  const transactionHistoryRef = useRef(transactionHistory);
  const walletRef = useRef(wallet);
  const fetchAllSolTransactionsRef = useRef(fetchAllSolTransactions);

  useEffect(() => {
    transactionHistoryRef.current = transactionHistory;
  }, [transactionHistory]);

  useEffect(() => {
    walletRef.current = wallet;
  }, [wallet]);

  useEffect(() => {
    fetchAllSolTransactionsRef.current = fetchAllSolTransactions;
  }, [fetchAllSolTransactions]);

  const getCacheKey = useCallback(
    (cluster: NetworkEnum.Mainnet | NetworkEnum.Devnet) => {
      return `${walletId}:${cluster}`;
    },
    [walletId]
  );

  const fetchTransactions = useCallback(
    async (
      cluster: NetworkEnum.Mainnet | NetworkEnum.Devnet,
      forceRefresh: boolean = false
    ) => {
      const cacheKey = getCacheKey(cluster);
      const clusterString =
        cluster === NetworkEnum.Mainnet ? "mainnet" : "devnet";

      const currentHistory = transactionHistoryRef.current;
      const cachedData = currentHistory[walletId.toString()]?.[clusterString];
      if (!forceRefresh && cachedData && cachedData.length > 0) {
        return;
      }

      setLoadingStates((prev) => ({ ...prev, [cacheKey]: true }));

      try {
        const currentWallet = walletRef.current;
        if (!currentWallet) return;

        const response = await fetchAllSolTransactionsRef.current({
          walletId: walletId.toString(),
          chain: ChainEnum.Solana,
          cluster,
          address: currentWallet.publicKey,
          limit: 20,
        });

        setTransactionHistory((prev) => ({
          ...prev,
          [walletId.toString()]: {
            ...(prev[walletId.toString()] || {}),
            [clusterString]: response.transactions,
          },
        }));
      } catch (error: any) {
        console.error("Error fetching transactions:", error);
        if (error?.message?.includes(NetworkConnectionEnum.NoInternet)) {
          toast.warning("Failed to fetch transactions. Please check your internet connection.");
        } else {
          toast.error("Failed to fetch transactions. Please try again.");
        }
      } finally {
        setLoadingStates((prev) => ({ ...prev, [cacheKey]: false }));
        setIsRefreshing(false);
      }
    },
    [walletId, getCacheKey, setLoadingStates, setTransactionHistory]
  );

  const fetchTransactionsRef = useRef(fetchTransactions);
  useEffect(() => {
    fetchTransactionsRef.current = fetchTransactions;
  }, [fetchTransactions]);

  useEffect(() => {
    if (!isOpen || !wallet) return;
    // On modal open, fetch for BOTH clusters if not cached yet (but only once per open)
    const clusters: (NetworkEnum.Mainnet | NetworkEnum.Devnet)[] = [
      NetworkEnum.Mainnet,
      NetworkEnum.Devnet,
    ];
    clusters.forEach((cluster) => {
      const clusterString =
        cluster === NetworkEnum.Mainnet ? "mainnet" : "devnet";
      const cachedData =
        transactionHistoryRef.current[walletId.toString()]?.[clusterString];
      if (!cachedData || cachedData.length === 0) {
        fetchTransactionsRef.current(cluster, false);
      }
    });
  }, [isOpen, walletId, wallet]);

  // use useMemo to ensure it updates when cluster or history changes
  const currentTransactions = useMemo((): TransactionInfo[] => {
    const clusterString =
      currentCluster === NetworkEnum.Mainnet ? "mainnet" : "devnet";
    return transactionHistory[walletId.toString()]?.[clusterString] || [];
  }, [transactionHistory, walletId, currentCluster]);

  // use useMemo to ensure same as currentTransactions
  const loading = useMemo((): boolean => {
    const cacheKey = getCacheKey(currentCluster);
    return loadingStates[cacheKey] || false;
  }, [loadingStates, currentCluster, getCacheKey]);

  const handleClusterToggle = useCallback(() => {
    const newCluster =
      currentCluster === NetworkEnum.Mainnet
        ? NetworkEnum.Devnet
        : NetworkEnum.Mainnet;

    setCurrentCluster(newCluster);
    // Persist cluster change so all ClusterToggle components (header/modal) stay synced
    toggleNetwork(ChainEnum.Solana, walletId);
  }, [currentCluster, walletId, toggleNetwork, ChainEnum, NetworkEnum]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchTransactionsRef.current(currentCluster, true);
  }, [currentCluster]);

  return {
    wallet,
    currentCluster,
    currentTransactions,
    loading,
    isRefreshing,
    handleClusterToggle,
    handleRefresh,
  };
};
