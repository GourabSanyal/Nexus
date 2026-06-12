import type { PublicEthereumWallet, PublicSolanaWallet } from "@my-org/zod";

export interface InlineActionsProps {
  wallet: PublicSolanaWallet | PublicEthereumWallet;
  onEditName: (newName: string) => void;
  onDelete: () => void;
}
