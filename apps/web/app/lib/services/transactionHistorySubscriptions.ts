import { NetworkEnum } from "@repo/store/src/enums/network";
import { TransactionInfo, PaginationInfo } from "@api-types/TransactionTypes";
import { historyCacheKey } from "@/app/components/ui/wallet/modals/utils/transactionHistoryCache";
import type { HistoryUpdateListener } from "@/app/types/components/TransactionHistoryFetchTypes";

/** In-memory sync mirrors of the latest fetch results (avoid Recoil/persist lag). */
const latestTransactionsByKey = new Map<string, TransactionInfo[]>();
const paginationByKey = new Map<string, PaginationInfo | null>();
const updatedListenersByKey = new Map<string, Set<HistoryUpdateListener>>();

export const notifyHistoryUpdated = (
  cacheKey: string,
  transactions: TransactionInfo[],
  pagination: PaginationInfo | null
): void => {
  latestTransactionsByKey.set(cacheKey, transactions);
  paginationByKey.set(cacheKey, pagination);
  updatedListenersByKey
    .get(cacheKey)
    ?.forEach((listener) => listener(transactions));
};

export const getLatestTransactions = (
  walletId: number,
  cluster: NetworkEnum
): TransactionInfo[] | undefined =>
  latestTransactionsByKey.get(historyCacheKey(walletId, cluster));

export const getLatestPagination = (
  walletId: number,
  cluster: NetworkEnum
): PaginationInfo | null | undefined =>
  paginationByKey.get(historyCacheKey(walletId, cluster));

export const hasMoreTransactions = (
  walletId: number,
  cluster: NetworkEnum
): boolean =>
  paginationByKey.get(historyCacheKey(walletId, cluster))?.has_more ?? false;

export const subscribeTransactionHistoryUpdated = (
  walletId: number,
  cluster: NetworkEnum,
  listener: HistoryUpdateListener
): (() => void) => {
  const cacheKey = historyCacheKey(walletId, cluster);
  if (!updatedListenersByKey.has(cacheKey)) {
    updatedListenersByKey.set(cacheKey, new Set());
  }
  updatedListenersByKey.get(cacheKey)!.add(listener);

  const latest = latestTransactionsByKey.get(cacheKey);
  if (latest) listener(latest);

  return () => {
    updatedListenersByKey.get(cacheKey)?.delete(listener);
  };
};
