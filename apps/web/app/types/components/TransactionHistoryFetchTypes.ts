import { NetworkEnum } from "@repo/store/src/enums/network";
import {
  TransactionInfo,
  TransactionHistoryStore,
} from "@api-types/TransactionTypes";
import { IWalletAdapter } from "@/app/lib/adapters/IWalletAdapter";

export type SetTransactionHistory = (
  // eslint-disable-next-line no-unused-vars
  updater: (_prev: TransactionHistoryStore) => TransactionHistoryStore
) => void;

export type SetLoadingStates = (
  // eslint-disable-next-line no-unused-vars
  updater: (_prev: Record<string, boolean>) => Record<string, boolean>
) => void;

export type HistoryUpdateListener = (
  // eslint-disable-next-line no-unused-vars
  _transactions: TransactionInfo[]
) => void;

export interface FetchWalletTransactionHistoryParams {
  walletId: number;
  publicKey: string;
  cluster: NetworkEnum;
  adapter: IWalletAdapter;
  setTransactionHistory: SetTransactionHistory;
  setLoadingStates: SetLoadingStates;
  /** Existing cache to enable incremental sync. */
  currentHistory?: TransactionHistoryStore;
}

export interface LoadMoreTransactionsParams
  extends FetchWalletTransactionHistoryParams {
  currentHistory: TransactionHistoryStore;
}
