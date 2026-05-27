import { NetworkEnum } from "@repo/store/src/enums/network";
import {
  TransactionInfo,
  PaginationInfo,
  TransactionHistoryStore,
} from "@api-types/TransactionTypes";

export type { TransactionHistoryStore, CachedTransactionData } from "@api-types/TransactionTypes";

export const historyCacheKey = (walletId: number, cluster: NetworkEnum) =>
  `${walletId}:${cluster}`;

export const clusterStorageKey = (cluster: NetworkEnum) =>
  cluster.toLowerCase();

export const readCachedTransactions = (
  history: TransactionHistoryStore,
  walletId: number,
  cluster: NetworkEnum
): TransactionInfo[] =>
  history[walletId.toString()]?.[clusterStorageKey(cluster)]?.transactions ?? [];

export const readCachedPagination = (
  history: TransactionHistoryStore,
  walletId: number,
  cluster: NetworkEnum
): PaginationInfo | null =>
  history[walletId.toString()]?.[clusterStorageKey(cluster)]?.pagination ?? null;

export const hasCachedTransactions = (cached: TransactionInfo[]) =>
  cached.length > 0;

export const hasHistoryChanged = (
  previous: TransactionInfo[],
  fetched: TransactionInfo[]
): boolean =>
  fetched.length !== previous.length ||
  (fetched[0]?.signature ?? "") !== (previous[0]?.signature ?? "");

export const getNewestCachedSignature = (
  history: TransactionHistoryStore,
  walletId: number,
  cluster: NetworkEnum
): string | undefined => readCachedTransactions(history, walletId, cluster)[0]?.signature;

export const getOldestCachedSignature = (
  history: TransactionHistoryStore,
  walletId: number,
  cluster: NetworkEnum
): string | undefined => {
  const txs = readCachedTransactions(history, walletId, cluster);
  return txs[txs.length - 1]?.signature;
};

const emptyCacheEntry = { transactions: [] as TransactionInfo[], pagination: null };

const writeCacheEntry = (
  prev: TransactionHistoryStore,
  walletId: number,
  cluster: NetworkEnum,
  transactions: TransactionInfo[],
  pagination: PaginationInfo | null
): TransactionHistoryStore => {
  const walletKey = walletId.toString();
  const clusterKey = clusterStorageKey(cluster);
  return {
    ...prev,
    [walletKey]: {
      ...(prev[walletKey] || {}),
      [clusterKey]: { transactions, pagination },
    },
  };
};

const dedupePrepend = (
  newer: TransactionInfo[],
  existing: TransactionInfo[]
): TransactionInfo[] => {
  const existingSignatures = new Set(existing.map((t) => t.signature));
  const uniqueNew = newer.filter((t) => !existingSignatures.has(t.signature));
  return [...uniqueNew, ...existing];
};

const dedupeAppend = (
  existing: TransactionInfo[],
  older: TransactionInfo[]
): TransactionInfo[] => {
  const existingSignatures = new Set(existing.map((t) => t.signature));
  const uniqueOlder = older.filter((t) => !existingSignatures.has(t.signature));
  return [...existing, ...uniqueOlder];
};

export const setTransactionsInHistory = (
  prev: TransactionHistoryStore,
  walletId: number,
  cluster: NetworkEnum,
  transactions: TransactionInfo[],
  pagination: PaginationInfo | null
): TransactionHistoryStore =>
  writeCacheEntry(prev, walletId, cluster, transactions, pagination);

export const prependTransactionsToHistory = (
  prev: TransactionHistoryStore,
  walletId: number,
  cluster: NetworkEnum,
  newTransactions: TransactionInfo[]
): TransactionHistoryStore => {
  if (newTransactions.length === 0) return prev;
  const existing =
    prev[walletId.toString()]?.[clusterStorageKey(cluster)] ?? emptyCacheEntry;
  return writeCacheEntry(
    prev,
    walletId,
    cluster,
    dedupePrepend(newTransactions, existing.transactions),
    existing.pagination
  );
};

export const appendTransactionsToHistory = (
  prev: TransactionHistoryStore,
  walletId: number,
  cluster: NetworkEnum,
  olderTransactions: TransactionInfo[],
  pagination: PaginationInfo | null
): TransactionHistoryStore => {
  if (olderTransactions.length === 0) return prev;
  const existing =
    prev[walletId.toString()]?.[clusterStorageKey(cluster)] ?? emptyCacheEntry;
  return writeCacheEntry(
    prev,
    walletId,
    cluster,
    dedupeAppend(existing.transactions, olderTransactions),
    pagination
  );
};

/** @deprecated Use setTransactionsInHistory instead */
export const mergeTransactionsIntoHistory = (
  prev: TransactionHistoryStore,
  walletId: number,
  cluster: NetworkEnum,
  transactions: TransactionInfo[]
): TransactionHistoryStore =>
  setTransactionsInHistory(prev, walletId, cluster, transactions, null);
