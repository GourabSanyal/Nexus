import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { NetworkEnum, ChainEnum, NetworkConnectionEnum } from "@my-org/store";
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

interface UseTransactionHistoryProps {
  walletId: number;
  isOpen: boolean;
  onRefreshBalance?: () => void;
}

export const useTransactionHistory = ({
  walletId,
  isOpen,
  onRefreshBalance,
}: UseTransactionHistoryProps) => {
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

  // adapter memoized like useSendModal to prevent infinite loop
  const adapter: IWalletAdapter | null = useMemo(() => {
    return wallet ? WalletAdapterFactory.create(wallet.type) : null;
  }, [wallet?.type]);

  const chain = adapter?.chain || ChainEnum.Solana;

  const networkManager = adapter
    ? useNetworkManager(adapter, chain, walletId)
    : null;

  // Use networkManager.currentNetwork directly,
  // ensures the modal stays in sync with header toggle, 
  // used reactive recoil management
  const currentCluster =
    networkManager?.currentNetwork ||
    adapter?.getDefaultNetwork() ||
    NetworkEnum.Mainnet;

  const transactionHistoryRef = useRef(transactionHistory);
  const walletRef = useRef(wallet);
  const adapterRef = useRef(adapter);

  useEffect(() => {
    transactionHistoryRef.current = transactionHistory;
  }, [transactionHistory]);

  useEffect(() => {
    walletRef.current = wallet;
  }, [wallet]);

  useEffect(() => {
    adapterRef.current = adapter;
  }, [adapter]);

  const getCacheKey = useCallback(
    (cluster: NetworkEnum) => {
      return `${walletId}:${cluster}`;
    },
    [walletId]
  );

  const getClusterString = useCallback((cluster: NetworkEnum): string => {
    return cluster.toLowerCase();
  }, []);

  const fetchTransactions = useCallback(
    async (
      cluster: NetworkEnum,
      forceRefresh: boolean = false,
      refreshBalanceOnChange: boolean = false
    ) => {
      if (!adapterRef.current || !walletRef.current) return;

      const cacheKey = getCacheKey(cluster);
      const clusterString = getClusterString(cluster);

      const currentHistory = transactionHistoryRef.current;
      const cachedData = currentHistory[walletId.toString()]?.[clusterString] || [];
      if (!forceRefresh && cachedData && cachedData.length > 0) {
        return;
      }

      setLoadingStates((prev) => ({ ...prev, [cacheKey]: true }));

      try {
        const currentWallet = walletRef.current;
        const currentAdapter = adapterRef.current;
        if (!currentWallet || !currentAdapter) return;

        if (chain === ChainEnum.Ethereum) {
          console.log("📤 [ETH Hook] Sending request to adapter.fetchTransactions", {
            address: currentWallet.publicKey,
            cluster,
            limit: 20,
            walletId,
          });
        }

        const response = await currentAdapter.fetchTransactions({
          address: currentWallet.publicKey,
          cluster: cluster as string,
          limit: 20,
        });
        const fetchedTransactions = response.transactions || [];
        const hasHistoryChanged =
          fetchedTransactions.length !== cachedData.length ||
          (fetchedTransactions[0]?.signature || "") !==
            (cachedData[0]?.signature || "");

        if (chain === ChainEnum.Ethereum) {
          console.log("✅ [ETH Hook] Received data from API in useTransactionHistory", {
            transactionCount: response.transactions?.length || 0,
            transactions: response.transactions,
            pagination: response.pagination,
            walletId,
            cluster,
          });
        }

        setTransactionHistory((prev) => ({
          ...prev,
          [walletId.toString()]: {
            ...(prev[walletId.toString()] || {}),
            [clusterString]: fetchedTransactions,
          },
        }));

        // Refresh wallet header balance only if transaction history changed.
        if (refreshBalanceOnChange && hasHistoryChanged && onRefreshBalance) {
          onRefreshBalance();
        }

        if (chain === ChainEnum.Ethereum) {
          console.log("💾 [ETH Hook] Data stored in transactionHistoryState", {
            walletId,
            cluster: clusterString,
            transactionCount: response.transactions?.length || 0,
          });
        }
      } catch (error: any) {
        console.error("Error fetching transactions:", error);
        if (error?.message?.includes(NetworkConnectionEnum.NoInternet)) {
          toast.warning(
            "Failed to fetch transactions. Please check your internet connection."
          );
        } else {
          toast.error("Failed to fetch transactions. Please try again.");
        }
      } finally {
        setLoadingStates((prev) => ({ ...prev, [cacheKey]: false }));
        setIsRefreshing(false);
      }
    },
    [
      walletId,
      getCacheKey,
      getClusterString,
      setLoadingStates,
      setTransactionHistory,
    ]
  );

  const fetchTransactionsRef = useRef(fetchTransactions);
  useEffect(() => {
    fetchTransactionsRef.current = fetchTransactions;
  }, [fetchTransactions]);

  useEffect(() => {
    if (!isOpen || !wallet || !adapter) return;
    // Fetch only the currently selected network to keep modal load fast.
    fetchTransactionsRef.current(currentCluster, false, false);
  }, [isOpen, walletId, wallet, adapter, currentCluster]);

  // use useMemo to ensure it updates when cluster or history changes
  const currentTransactions = useMemo((): TransactionInfo[] => {
    const clusterString = getClusterString(currentCluster);
    const transactions = transactionHistory[walletId.toString()]?.[clusterString] || [];
    
    if (chain === ChainEnum.Ethereum && transactions.length > 0) {
      console.log("📖 [ETH Hook] Retrieved transactions from state for rendering", {
        walletId,
        cluster: clusterString,
        transactionCount: transactions.length,
        transactions,
      });
    }
    
    return transactions;
  }, [transactionHistory, walletId, currentCluster, getClusterString, chain]);

  // use useMemo to ensure same as currentTransactions
  const loading = useMemo((): boolean => {
    const cacheKey = getCacheKey(currentCluster);
    return loadingStates[cacheKey] || false;
  }, [loadingStates, currentCluster, getCacheKey]);

  const handleClusterToggle = useCallback(() => {
    if (!networkManager) return;
    networkManager.toggle();
  }, [networkManager]);

  const handleRefresh = useCallback(async () => {
    if (chain === ChainEnum.Ethereum) {
      console.log("📥 [ETH Hook] Received refresh request in useTransactionHistory", {
        walletId,
        currentCluster,
        chain,
      });
    }
    setIsRefreshing(true);
    await fetchTransactionsRef.current(currentCluster, true, true);
  }, [currentCluster, chain, walletId, onRefreshBalance]);

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
