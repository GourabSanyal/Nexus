import { ChainEnum } from "@repo/store/src/enums/network"
import { NetworkEnum } from "@repo/store/src/enums/network";export type Chain = "solana" | "ethereum";

export interface BalanceParams {
  chain: ChainEnum.Solana | ChainEnum.Ethereum;
  address: string;
  cluster: NetworkEnum.Devnet | NetworkEnum.Mainnet | NetworkEnum.Sepolia | NetworkEnum.Holesky;
}
