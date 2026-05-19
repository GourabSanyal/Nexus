import { useMemo } from "react";
import { useRecoilValue } from "recoil";
import {
  ChainEnum,
  NetworkEnum,
  selectWalletById,
  walletState,
} from "@my-org/store";
import { WalletAdapterFactory } from "@/app/lib/adapters/WalletAdapterFactory";
import { useNetworkManager } from "@/app/hooks/useNetworkManager";
import { IWalletAdapter } from "@/app/lib/adapters/IWalletAdapter";
import { useTransactionHistoryFetch } from "./useTransactionHistoryFetch";
import { useTransactionHistoryDisplay } from "./useTransactionHistoryDisplay";

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
  const wallet = selectWalletById(walletStateValue, walletId);

  const adapter: IWalletAdapter | null = useMemo(() => {
    return wallet ? WalletAdapterFactory.create(wallet.type) : null;
  }, [wallet?.type]);

  const chain = adapter?.chain ?? ChainEnum.Solana;
  const networkManager = useNetworkManager(adapter, chain, walletId);

  const currentCluster =
    networkManager.currentNetwork ||
    adapter?.getDefaultNetwork() ||
    NetworkEnum.Mainnet;

  const { isRefreshing, fetchVersion, handleRefresh } = useTransactionHistoryFetch({
    walletId,
    isOpen,
    currentCluster,
    wallet,
    adapter,
    onRefreshBalance,
  });

  const { currentTransactions, hasCachedList, loading } =
    useTransactionHistoryDisplay({
      walletId,
      currentCluster,
      fetchVersion,
    });

  const handleClusterToggle = () => {
    networkManager.toggle();
  };

  return {
    wallet,
    chain,
    currentCluster,
    currentTransactions,
    loading,
    isRefreshing,
    hasCachedList,
    handleClusterToggle,
    handleRefresh,
    currencySymbol: adapter?.getCurrencySymbol() ?? "SOL",
  };
};
