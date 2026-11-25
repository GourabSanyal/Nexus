import { NetworkEnum } from "@repo/store";

export interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicKey: string;
  walletType: "solana" | "ethereum";
  network: NetworkEnum;
}
