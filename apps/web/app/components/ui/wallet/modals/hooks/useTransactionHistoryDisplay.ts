import { useMemo } from "react";
import { useRecoilValue } from "recoil";
import { NetworkEnum } from "@my-org/store";
import { TransactionInfo } from "@api-types/TransactionTypes";
import {
  transactionHistoryState,
  transactionHistoryLoadingState,
} from "@repo/store/src/atoms/transactionHistoryState";
import {
  hasCachedTransactions,
  historyCacheKey,
  TransactionHistoryStore,
} from "../utils/transactionHistoryCache";
import { resolveDisplayTransactions } from "./transactionHistoryResolve";

type UseTransactionHistoryDisplayParams = {
  walletId: number;
  currentCluster: NetworkEnum;
  fetchVersion: number;
};

export const useTransactionHistoryDisplay = ({
  walletId,
  currentCluster,
  fetchVersion,
}: UseTransactionHistoryDisplayParams) => {
  const transactionHistory = useRecoilValue(transactionHistoryState);
  const loadingStates = useRecoilValue(transactionHistoryLoadingState);
  const cacheKey = historyCacheKey(walletId, currentCluster);

  const currentTransactions = useMemo((): TransactionInfo[] => {
    return resolveDisplayTransactions(
      transactionHistory as TransactionHistoryStore,
      walletId,
      currentCluster
    );
    // fetchVersion intentionally referenced to invalidate when in-flight fetches complete
    // without changing Recoil state (e.g. dedup'd joins of in-flight requests)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionHistory, walletId, currentCluster, fetchVersion]);

  const hasCachedList = useMemo(
    () => hasCachedTransactions(currentTransactions),
    [currentTransactions]
  );

  const loading = loadingStates[cacheKey] || false;

  return { currentTransactions, hasCachedList, loading };
};
