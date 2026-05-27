import { NetworkEnum } from "@repo/store/src/enums/network";
import {
  TransactionInfo,
  PaginationInfo,
  TransactionHistoryStore,
} from "@api-types/TransactionTypes";
import {
  historyCacheKey,
  readCachedTransactions,
  setTransactionsInHistory,
  prependTransactionsToHistory,
  appendTransactionsToHistory,
} from "@/app/components/ui/wallet/modals/utils/transactionHistoryCache";
import type {
  FetchWalletTransactionHistoryParams,
  LoadMoreTransactionsParams,
  SetTransactionHistory,
} from "@/app/types/components/TransactionHistoryFetchTypes";
import { notifyHistoryUpdated } from "./transactionHistorySubscriptions";

const DEFAULT_PAGE_SIZE = 20;

interface IncrementalMergeArgs {
  walletId: number;
  cluster: NetworkEnum;
  cached: TransactionInfo[];
  fetched: TransactionInfo[];
  pagination: PaginationInfo | null;
  newestSignature: string | undefined;
  setTransactionHistory: SetTransactionHistory;
}

/** Picks prepend vs replace strategy based on whether we had a cache anchor. */
const applyIncrementalMerge = (args: IncrementalMergeArgs): TransactionInfo[] => {
  const {
    walletId,
    cluster,
    cached,
    fetched,
    pagination,
    newestSignature,
    setTransactionHistory,
  } = args;

  if (newestSignature && fetched.length > 0) {
    setTransactionHistory((prev: TransactionHistoryStore) =>
      prependTransactionsToHistory(prev, walletId, cluster, fetched)
    );
    return [...fetched, ...cached];
  }
  if (fetched.length > 0) {
    setTransactionHistory((prev: TransactionHistoryStore) =>
      setTransactionsInHistory(prev, walletId, cluster, fetched, pagination)
    );
    return fetched;
  }
  return cached;
};

/** Incremental sync runner: fetch only transactions newer than the cached head. */
export const runIncrementalFetch = async ({
  walletId,
  publicKey,
  cluster,
  adapter,
  setTransactionHistory,
  setLoadingStates,
  currentHistory,
}: FetchWalletTransactionHistoryParams): Promise<TransactionInfo[]> => {
  const cacheKey = historyCacheKey(walletId, cluster);
  setLoadingStates((prev) => ({ ...prev, [cacheKey]: true }));

  try {
    const cached = currentHistory
      ? readCachedTransactions(currentHistory, walletId, cluster)
      : [];
    const newestSignature = cached[0]?.signature;

    const response = await adapter.fetchTransactions({
      address: publicKey,
      cluster: cluster as string,
      limit: DEFAULT_PAGE_SIZE,
      untilSignature: newestSignature,
    });
    const fetched = response.transactions ?? [];
    const pagination = response.pagination ?? null;

    const merged = applyIncrementalMerge({
      walletId,
      cluster,
      cached,
      fetched,
      pagination,
      newestSignature,
      setTransactionHistory,
    });

    notifyHistoryUpdated(cacheKey, merged, pagination);
    return merged;
  } finally {
    setLoadingStates((prev) => ({ ...prev, [cacheKey]: false }));
  }
};

/** Pagination runner: fetch transactions older than the cached tail. */
export const runLoadMore = async ({
  walletId,
  publicKey,
  cluster,
  adapter,
  setTransactionHistory,
  setLoadingStates,
  currentHistory,
}: LoadMoreTransactionsParams): Promise<TransactionInfo[]> => {
  const cacheKey = historyCacheKey(walletId, cluster);
  const loadMoreKey = `${cacheKey}:loadMore`;
  setLoadingStates((prev) => ({ ...prev, [loadMoreKey]: true }));

  try {
    const cached = readCachedTransactions(currentHistory, walletId, cluster);
    const oldestSignature = cached[cached.length - 1]?.signature;
    if (!oldestSignature) return cached;

    const response = await adapter.fetchTransactions({
      address: publicKey,
      cluster: cluster as string,
      limit: DEFAULT_PAGE_SIZE,
      cursor: oldestSignature,
    });
    const older = response.transactions ?? [];
    const pagination = response.pagination ?? null;

    if (older.length > 0) {
      setTransactionHistory((prev) =>
        appendTransactionsToHistory(prev, walletId, cluster, older, pagination)
      );
    }

    const merged = [...cached, ...older];
    notifyHistoryUpdated(cacheKey, merged, pagination);
    return merged;
  } finally {
    setLoadingStates((prev) => ({ ...prev, [loadMoreKey]: false }));
  }
};
