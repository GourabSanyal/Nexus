import { NetworkEnum } from "@repo/store/src/enums/network";

export interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicKey: string;
  walletType: "solana" | "ethereum";
  network: NetworkEnum;
}
