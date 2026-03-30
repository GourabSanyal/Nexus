import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";

export interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicKey: string;
  chain: ChainEnum;
  network: NetworkEnum;
}