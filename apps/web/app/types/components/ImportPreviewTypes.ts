import type { FlatImportWalletEntry } from "@my-org/zod";

export type ImportPreviewWalletView = {
  entry: FlatImportWalletEntry;
  id: string;
  chainLabel: string;
  networkLabel: string;
  networkColorClass: string;
  currencySymbol: string;
  formattedBalance: string;
  formattedAddress: string;
  schemeLabel: string;
  transactionCount: number;
};

export type ImportPreviewWalletRowProps = {
  wallet: ImportPreviewWalletView;
  isSelected: boolean;
  onToggle: (id: string) => void;
};

export type ImportPreviewProps = {
  wallets: ImportPreviewWalletView[];
  selectedIds: string[];
  onToggleWallet: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onConfirm: () => void | Promise<void>;
  onBack: () => void;
  isConfirmDisabled: boolean;
  isPersisting?: boolean;
};
