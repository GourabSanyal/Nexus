export type WalletActionType = "generate" | "import";

export interface WalletActionButtonProps {
  actionType: WalletActionType;
  onClick: () => void;
  className?: string;
}

export interface WalletActionsProps {
  generateWallet: () => void;
  importWallet: () => void;
}
