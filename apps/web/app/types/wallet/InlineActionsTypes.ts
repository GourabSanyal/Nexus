import { EthereumWallet, SolanaWallet } from "@my-org/zod";

export interface InlineActionsProps {
  wallet: SolanaWallet | EthereumWallet;
  onEditName: (newName: string) => void;
  onDelete: () => void;
}
