import { NetworkEnum } from "@my-org/store";
import type { PublicEthereumWallet, PublicSolanaWallet } from "@my-org/zod";
import { IWalletAdapter } from "@/app/lib/adapters/IWalletAdapter";

export type WalletRef = PublicSolanaWallet | PublicEthereumWallet | undefined;

export interface FetchOptions {
  forceRefresh?: boolean;
  refreshBalanceOnChange?: boolean;
}

export interface UseTransactionHistoryFetchParams {
  walletId: number;
  isOpen: boolean;
  currentCluster: NetworkEnum;
  wallet: WalletRef;
  adapter: IWalletAdapter | null;
  onRefreshBalance?: () => void;
}

export interface TransactionHistoryFetchResult {
  isRefreshing: boolean;
  isLoadingMore: boolean;
  canLoadMore: boolean;
  fetchVersion: number;
  handleRefresh: () => Promise<void>;
  handleLoadMore: () => Promise<void>;
}
