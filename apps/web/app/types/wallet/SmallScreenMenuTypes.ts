import type { PublicEthereumWallet, PublicSolanaWallet } from "@repo/zod";

export interface SmallScreenMenuProps {
  wallet: PublicSolanaWallet | PublicEthereumWallet;
  onRefresh: () => void;
  onEditName: (newName: string) => void;
  onDelete: () => void;
}
