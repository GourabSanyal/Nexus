import { NetworkEnum } from "@repo/store/src/enums/network";
import { TransactionInfo } from "@api-types/TransactionTypes";

export type TransactionHistoryStore = Record<
  string,
  Record<string, TransactionInfo[]>
>;

export const historyCacheKey = (walletId: number, cluster: NetworkEnum) =>
  `${walletId}:${cluster}`;

export const clusterStorageKey = (cluster: NetworkEnum) =>
  cluster.toLowerCase();

export const readCachedTransactions = (
  history: TransactionHistoryStore,
  walletId: number,
  cluster: NetworkEnum
): TransactionInfo[] =>
  history[walletId.toString()]?.[clusterStorageKey(cluster)] ?? [];

export const hasCachedTransactions = (cached: TransactionInfo[]) =>
  cached.length > 0;

export const hasHistoryChanged = (
  previous: TransactionInfo[],
  fetched: TransactionInfo[]
): boolean =>
  fetched.length !== previous.length ||
  (fetched[0]?.signature ?? "") !== (previous[0]?.signature ?? "");

export const mergeTransactionsIntoHistory = (
  prev: TransactionHistoryStore,
  walletId: number,
  cluster: NetworkEnum,
  transactions: TransactionInfo[]
): TransactionHistoryStore => {
  const walletKey = walletId.toString();
  const clusterKey = clusterStorageKey(cluster);
  return {
    ...prev,
    [walletKey]: {
      ...(prev[walletKey] || {}),
      [clusterKey]: transactions,
    },
  };
};
