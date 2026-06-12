import { useCallback, useState, MutableRefObject } from "react";
import { useSetRecoilState } from "recoil";
import { NetworkEnum } from "@my-org/store";
import {
  transactionHistoryState,
  transactionHistoryLoadingState,
} from "@repo/store/src/atoms/transactionHistoryState";
import { TransactionHistoryStore } from "@api-types/TransactionTypes";
import { IWalletAdapter } from "@/app/lib/adapters/IWalletAdapter";
import type { PublicEthereumWallet, PublicSolanaWallet } from "@my-org/zod";
import {
  loadMoreTransactionHistory,
  isLoadMoreInFlight,
} from "@/app/lib/services/transactionHistoryFetch";
import { showTransactionFetchError } from "./transactionHistoryResolve";

type WalletRef = PublicSolanaWallet | PublicEthereumWallet | undefined;

interface UseLoadMoreTransactionsParams {
  walletId: number;
  currentCluster: NetworkEnum;
  walletRef: MutableRefObject<WalletRef>;
  adapterRef: MutableRefObject<IWalletAdapter | null>;
  historyRef: MutableRefObject<unknown>;
  onSuccess: () => void;
  onRefreshBalance?: MutableRefObject<(() => void) | undefined>;
}

export const useLoadMoreTransactions = ({
  walletId,
  currentCluster,
  walletRef,
  adapterRef,
  historyRef,
  onSuccess,
  onRefreshBalance,
}: UseLoadMoreTransactionsParams) => {
  const setTransactionHistory = useSetRecoilState(transactionHistoryState);
  const setLoadingStates = useSetRecoilState(transactionHistoryLoadingState);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = useCallback(async () => {
    const currentWallet = walletRef.current;
    const currentAdapter = adapterRef.current;
    if (!currentWallet || !currentAdapter) return;
    if (isLoadMoreInFlight(walletId, currentCluster)) return;

    setIsLoadingMore(true);
    try {
      const txs = await loadMoreTransactionHistory({
        walletId,
        publicKey: currentWallet.publicKey,
        cluster: currentCluster,
        adapter: currentAdapter,
        setTransactionHistory,
        setLoadingStates,
        currentHistory: historyRef.current as TransactionHistoryStore,
      });
      onSuccess();
      if (txs.length > 0 && onRefreshBalance?.current) {
        onRefreshBalance.current();
      }
    } catch (error: unknown) {
      showTransactionFetchError(error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    walletId,
    currentCluster,
    walletRef,
    adapterRef,
    historyRef,
    onSuccess,
    onRefreshBalance,
    setTransactionHistory,
    setLoadingStates,
  ]);

  return { isLoadingMore, handleLoadMore };
};
