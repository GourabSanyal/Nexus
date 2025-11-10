export interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  chain: "solana" | "ethereum";
  walletId: number;
  network: "solana" | "ethereum";
}