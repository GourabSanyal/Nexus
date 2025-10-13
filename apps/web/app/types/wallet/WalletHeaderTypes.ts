import { EthereumWallet, SolanaWallet } from "@my-org/zod";

export interface WalletHeaderProps {
  wallet: SolanaWallet | EthereumWallet;
  balance: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onEditName: (newName: string) => void;
  onDelete: () => void;
}
