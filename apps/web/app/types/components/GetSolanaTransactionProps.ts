import { NetworkEnum } from "@repo/store/src/enums/network";

export interface GetSolTransactionsParams {
  address: string;
  cluster: NetworkEnum.Devnet | NetworkEnum.Mainnet;
  limit?: number;
}
