import { EthereumWallet, SolanaWallet } from "@my-org/zod";

export interface SmallScreenMenuProps {
  wallet: SolanaWallet | EthereumWallet;
  onRefresh: () => void;
  onEditName: (newName: string) => void;
  onDelete: () => void;
}
