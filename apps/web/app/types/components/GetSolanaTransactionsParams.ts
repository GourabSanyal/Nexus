import { NetworkEnum } from "@repo/store";

export interface GetSolanaTransactionsParams {
  address: string;
  cluster: NetworkEnum.Devnet | NetworkEnum.Mainnet;
  limit?: number;
  /** Fetch transactions older than this signature (for "load more" pagination) */
  cursor?: string;
  /** Stop fetching when this signature is found (for incremental sync) */
  untilSignature?: string;
}

/** @deprecated Use GetSolanaTransactionsParams */
export type GetSolTransactionsParams = GetSolanaTransactionsParams;
