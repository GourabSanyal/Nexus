import type { PublicEthereumWallet, PublicSolanaWallet } from "@my-org/zod";

export interface WalletHeaderProps {
  wallet: PublicSolanaWallet | PublicEthereumWallet;
  balance?: string | bigint;
  isRefreshing: boolean;
  onRefresh: () => void;
  onEditName: (newName: string) => void;
  onDelete: () => void;
}
