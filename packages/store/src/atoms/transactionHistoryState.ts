import { atom } from "recoil";
import { persistAtom } from "../persistence/recoilPersistConfig";
import { TransactionHistoryStore } from "@repo/api/src/types/TransactionTypes";

// Re-export canonical types so external consumers can import from this atom module if desired
export type { CachedTransactionData, TransactionHistoryStore } from "@repo/api/src/types/TransactionTypes";

/**
 * Persisted transaction history per wallet+cluster.
 * Shape: Record<walletId, Record<cluster, { transactions, pagination }>>.
 */
export const transactionHistoryState = atom<TransactionHistoryStore>({
  key: "transactionHistoryState",
  default: {},
  effects_UNSTABLE: [persistAtom],
});

/** Loading state per cache key (`walletId:cluster` or `walletId:cluster:loadMore`). */
export const transactionHistoryLoadingState = atom<Record<string, boolean>>({
  key: "transactionHistoryLoadingState",
  default: {},
});

