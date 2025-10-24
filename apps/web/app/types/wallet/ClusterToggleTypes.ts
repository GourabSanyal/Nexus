import { ChainEnum } from "@my-org/store";

export interface ClusterToggleProps {
  chain: ChainEnum.Ethereum | ChainEnum.Solana;
  walletId: number;
}
