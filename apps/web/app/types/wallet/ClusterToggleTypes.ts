import { ChainEnum, NetworkEnum } from "@my-org/store";

export interface ClusterToggleProps {
  chain: ChainEnum.Ethereum | ChainEnum.Solana;
  walletId: number;
  onToggle?: () => void;
  currentNetwork?: NetworkEnum;
}
