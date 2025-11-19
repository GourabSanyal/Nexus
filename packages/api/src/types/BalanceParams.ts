import { ChainEnum, NetworkEnum } from "./network.js";

export interface BalanceParams {
  chain: ChainEnum.Solana | ChainEnum.Ethereum;
  address: string;
  cluster: NetworkEnum.Devnet | NetworkEnum.Mainnet | NetworkEnum.Sepolia | NetworkEnum.Holesky;
}
