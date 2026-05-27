export interface TransactionInfo {
  signature: string;
  slot: number;
  block_time: number | null;
  status: string; // "success" | "failed"
  err: any | null;
  confirmation_status: string | null;
  amount: number | null; 
  fee: number | null; 
  direction: string | null; // "sent" | "received" | "self"
  from_address: string | null;
  to_address: string | null;
  memo: string | null;
}

export interface PaginationInfo {
  has_more: boolean;
  next_cursor: string | null;
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

