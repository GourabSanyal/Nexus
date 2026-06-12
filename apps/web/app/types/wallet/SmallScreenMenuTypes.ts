import type { PublicEthereumWallet, PublicSolanaWallet } from "@my-org/zod";

export interface SmallScreenMenuProps {
  wallet: PublicSolanaWallet | PublicEthereumWallet;
  onRefresh: () => void;
  onEditName: (newName: string) => void;
  onDelete: () => void;
}
