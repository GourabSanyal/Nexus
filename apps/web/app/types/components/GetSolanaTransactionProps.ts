import { NetworkEnum } from "@repo/store/src/enums/network";

export interface GetSolTransactionsParams {
  address: string;
  cluster: NetworkEnum.Devnet | NetworkEnum.Mainnet;
  limit?: number;
  /** Fetch transactions older than this signature (for "load more" pagination) */
  cursor?: string;
  /** Stop fetching when this signature is found (for incremental sync) */
  untilSignature?: string;
}
