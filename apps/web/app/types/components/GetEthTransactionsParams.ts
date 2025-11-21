import { NetworkEnum } from "@repo/store/src/enums/network";

export interface GetEthTransactionsParams {
  address: string;
  cluster: NetworkEnum.Mainnet | NetworkEnum.Sepolia | NetworkEnum.Holesky;
  limit?: number;
}

