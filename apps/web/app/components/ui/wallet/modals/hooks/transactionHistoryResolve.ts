import { NetworkEnum, NetworkConnectionEnum } from "@my-org/store";
import { TransactionInfo } from "@api-types/TransactionTypes";
import { toast } from "sonner";
import {
  hasHistoryChanged,
  readCachedTransactions,
  TransactionHistoryStore,
} from "../utils/transactionHistoryCache";
import { getLatestTransactions } from "@/app/lib/services/transactionHistoryFetch";

export const getFetchErrorMessage = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "";
};

/** Prefer fresher of Recoil vs in-memory fetch cache (empty module `[]` must not block Recoil). */
export const resolveDisplayTransactions = (
  recoilHistory: TransactionHistoryStore,
  walletId: number,
  cluster: NetworkEnum
): TransactionInfo[] => {
  const fromRecoil = readCachedTransactions(recoilHistory, walletId, cluster);
  const fromModule = getLatestTransactions(walletId, cluster) ?? [];

  if (!fromModule.length) return fromRecoil;
  if (!fromRecoil.length) return fromModule;
  if (hasHistoryChanged(fromRecoil, fromModule)) {
    return fromModule.length >= fromRecoil.length ? fromModule : fromRecoil;
  }
  return fromRecoil;
};

export const showTransactionFetchError = (error: unknown): void => {
  console.error("Error fetching transactions:", error);
  const message = getFetchErrorMessage(error);
  if (message.includes(NetworkConnectionEnum.NoInternet)) {
    toast.warning(
      "Failed to fetch transactions. Please check your internet connection."
    );
    return;
  }
  toast.error("Failed to fetch transactions. Please try again.");
};
