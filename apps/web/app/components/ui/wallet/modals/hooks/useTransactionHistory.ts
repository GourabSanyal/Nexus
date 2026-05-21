import { useRecoilValue } from "recoil";
import {
  ChainEnum,
  NetworkEnum,
  selectWalletById,
  walletState,
} from "@my-org/store";
import { useNetworkManager } from "@/app/hooks/useNetworkManager";
import { useWalletAdapter } from "@/app/lib/adapters/useWalletAdapter";
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

  const adapter = useWalletAdapter(wallet?.type);

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
    adapter,
    chain,
    currentCluster,
    currentTransactions,
    loading,
    isRefreshing,
    hasCachedList,
    handleClusterToggle,
    handleRefresh,
  };
};
