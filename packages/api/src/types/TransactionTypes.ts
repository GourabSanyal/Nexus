export interface TransactionInfo {
  signature: string;
  slot: number;
  blockTime: number | null;
  status: string; // "success" | "failed"
  err: any | null;
  confirmationStatus: string | null;
  amount: number | null;
  fee: number | null;
  direction: string | null; // "sent" | "received" | "self"
  fromAddress: string | null;
  toAddress: string | null;
  memo: string | null;
}

export interface PaginationInfo {
  hasMore: boolean;
  nextCursor: string | null;
  limit: number;
}

export interface TransactionResponse {
  transactions: TransactionInfo[];
  pagination: PaginationInfo | null;
}

export interface TransactionRequest {
  address: string;
  cluster: string;
  limit?: number;
  /** Fetch transactions older than this signature (for "load more" pagination) */
  cursor?: string;
  /** Stop fetching when this signature is found (for incremental sync - fetch only new txs) */
  untilSignature?: string;
}

/** Persisted cache entry: list of transactions + pagination metadata for that wallet+cluster. */
export interface CachedTransactionData {
  transactions: TransactionInfo[];
  pagination: PaginationInfo | null;
}

/** Recoil store shape: Record<walletId, Record<cluster, CachedTransactionData>>. */
export type TransactionHistoryStore = Record<
  string,
  Record<string, CachedTransactionData>
>;
