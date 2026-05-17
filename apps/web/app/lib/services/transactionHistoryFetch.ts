import { NetworkEnum } from "@repo/store/src/enums/network";
import { TransactionInfo } from "@api-types/TransactionTypes";
import { IWalletAdapter } from "@/app/lib/adapters/IWalletAdapter";
import {
  historyCacheKey,
  mergeTransactionsIntoHistory,
  TransactionHistoryStore,
} from "@/app/components/ui/wallet/modals/utils/transactionHistoryCache";

type SetTransactionHistory = (
  updater: (prev: TransactionHistoryStore) => TransactionHistoryStore
) => void;

type SetLoadingStates = (
  updater: (prev: Record<string, boolean>) => Record<string, boolean>
) => void;

type HistoryUpdateListener = (transactions: TransactionInfo[]) => void;

const inFlightByKey = new Map<string, Promise<TransactionInfo[]>>();
const updatedListenersByKey = new Map<string, Set<HistoryUpdateListener>>();
/** Latest fetch result per wallet+cluster — sync read for open modals (avoids Recoil/persist lag). */
const latestTransactionsByKey = new Map<string, TransactionInfo[]>();

const notifyHistoryUpdated = (
  cacheKey: string,
  transactions: TransactionInfo[]
) => {
  latestTransactionsByKey.set(cacheKey, transactions);
  updatedListenersByKey.get(cacheKey)?.forEach((listener) =>
    listener(transactions)
  );
};

export type FetchWalletTransactionHistoryParams = {
  walletId: number;
  publicKey: string;
  cluster: NetworkEnum;
  adapter: IWalletAdapter;
  setTransactionHistory: SetTransactionHistory;
  setLoadingStates: SetLoadingStates;
};

const runFetch = async ({
  walletId,
  publicKey,
  cluster,
  adapter,
  setTransactionHistory,
  setLoadingStates,
}: FetchWalletTransactionHistoryParams): Promise<TransactionInfo[]> => {
  const cacheKey = historyCacheKey(walletId, cluster);
  setLoadingStates((prev) => ({ ...prev, [cacheKey]: true }));

  try {
    const response = await adapter.fetchTransactions({
      address: publicKey,
      cluster: cluster as string,
      limit: 20,
    });
    const transactions = response.transactions ?? [];

    setTransactionHistory((prev) =>
      mergeTransactionsIntoHistory(prev, walletId, cluster, transactions)
    );
    notifyHistoryUpdated(cacheKey, transactions);

    return transactions;
  } finally {
    setLoadingStates((prev) => ({ ...prev, [cacheKey]: false }));
  }
};

/** Deduplicated fetch shared by header refresh and history modal. */
export const fetchWalletTransactionHistory = (
  params: FetchWalletTransactionHistoryParams
): Promise<TransactionInfo[]> => {
  const cacheKey = historyCacheKey(params.walletId, params.cluster);
  const existing = inFlightByKey.get(cacheKey);
  if (existing) {
    return existing;
  }

  const promise = runFetch(params).finally(() => {
    if (inFlightByKey.get(cacheKey) === promise) {
      inFlightByKey.delete(cacheKey);
    }
  });

  inFlightByKey.set(cacheKey, promise);
  return promise;
};

export const isTransactionHistoryFetchInFlight = (
  walletId: number,
  cluster: NetworkEnum
): boolean => inFlightByKey.has(historyCacheKey(walletId, cluster));

/** Join an in-flight fetch started elsewhere (e.g. header balance refresh). */
export const getInFlightTransactionHistoryFetch = (
  walletId: number,
  cluster: NetworkEnum
): Promise<TransactionInfo[]> | undefined =>
  inFlightByKey.get(historyCacheKey(walletId, cluster));

export const getLatestTransactions = (
  walletId: number,
  cluster: NetworkEnum
): TransactionInfo[] | undefined =>
  latestTransactionsByKey.get(historyCacheKey(walletId, cluster));

/** Notified with merged transactions after each successful fetch for wallet+cluster. */
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
  if (latest) {
    listener(latest);
  }

  return () => {
    updatedListenersByKey.get(cacheKey)?.delete(listener);
  };
};
