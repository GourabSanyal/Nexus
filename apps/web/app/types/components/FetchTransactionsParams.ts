import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";

export interface FetchTransactionsParams {
  chain: ChainEnum;
  address: string;
  cluster: NetworkEnum;
  limit?: number;
  /** Fetch transactions older than this signature (for "load more" pagination) */
  cursor?: string;
  /** Stop fetching when this signature is found (for incremental sync) */
  untilSignature?: string;
}
