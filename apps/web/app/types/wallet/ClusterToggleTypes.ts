import { ChainEnum, NetworkEnum } from "@repo/store";

export interface ClusterToggleProps {
  chain: ChainEnum.Ethereum | ChainEnum.Solana;
  walletId: number;
  onToggle?: () => void;
  currentNetwork?: NetworkEnum;
}
