import { NetworkEnum } from "@repo/store/src/enums/network";
import { TransactionInfo } from "@api-types/TransactionTypes";
import { historyCacheKey } from "@/app/components/ui/wallet/modals/utils/transactionHistoryCache";
import type {
  FetchWalletTransactionHistoryParams,
  LoadMoreTransactionsParams,
} from "@/app/types/components/TransactionHistoryFetchTypes";
import {
  runIncrementalFetch,
  runLoadMore,
} from "./transactionHistoryRunners";

export {
  getLatestTransactions,
  getLatestPagination,
  hasMoreTransactions,
  subscribeTransactionHistoryUpdated,
} from "./transactionHistorySubscriptions";

export type {
  FetchWalletTransactionHistoryParams,
  LoadMoreTransactionsParams,
} from "@/app/types/components/TransactionHistoryFetchTypes";

const inFlightByKey = new Map<string, Promise<TransactionInfo[]>>();
const loadMoreInFlightByKey = new Map<string, Promise<TransactionInfo[]>>();

/** Dedupe + run an in-flight promise per cache key. */
const dedupePromise = (
  store: Map<string, Promise<TransactionInfo[]>>,
  cacheKey: string,
  factory: () => Promise<TransactionInfo[]>
): Promise<TransactionInfo[]> => {
  const existing = store.get(cacheKey);
  if (existing) return existing;
  const promise = factory().finally(() => {
    if (store.get(cacheKey) === promise) store.delete(cacheKey);
  });
  store.set(cacheKey, promise);
  return promise;
};

/** Deduplicated incremental fetch shared by header refresh and history modal. */
export const fetchWalletTransactionHistory = (
  params: FetchWalletTransactionHistoryParams
): Promise<TransactionInfo[]> =>
  dedupePromise(
    inFlightByKey,
    historyCacheKey(params.walletId, params.cluster),
    () => runIncrementalFetch(params)
  );

/** Deduplicated pagination ("load more") fetch. */
export const loadMoreTransactionHistory = (
  params: LoadMoreTransactionsParams
): Promise<TransactionInfo[]> =>
  dedupePromise(
    loadMoreInFlightByKey,
    historyCacheKey(params.walletId, params.cluster),
    () => runLoadMore(params)
  );

export const isTransactionHistoryFetchInFlight = (
  walletId: number,
  cluster: NetworkEnum
): boolean => inFlightByKey.has(historyCacheKey(walletId, cluster));

export const isLoadMoreInFlight = (
  walletId: number,
  cluster: NetworkEnum
): boolean => loadMoreInFlightByKey.has(historyCacheKey(walletId, cluster));

/** Join an in-flight fetch started elsewhere (e.g. header balance refresh). */
export const getInFlightTransactionHistoryFetch = (
  walletId: number,
  cluster: NetworkEnum
): Promise<TransactionInfo[]> | undefined =>
  inFlightByKey.get(historyCacheKey(walletId, cluster));
