import type { PublicEthereumWallet, PublicSolanaWallet } from "@repo/zod";

export interface InlineActionsProps {
  wallet: PublicSolanaWallet | PublicEthereumWallet;
  onEditName: (newName: string) => void;
  onDelete: () => void;
}
