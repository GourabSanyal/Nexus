import { NetworkEnum } from "@repo/store";

export interface GetEthTransactionsParams {
  address: string;
  cluster: NetworkEnum.Mainnet | NetworkEnum.Sepolia | NetworkEnum.Holesky;
  limit?: number;
  /** Fetch transactions older than this signature (for "load more" pagination) */
  cursor?: string;
  /** Stop fetching when this signature is found (for incremental sync) */
  untilSignature?: string;
}

