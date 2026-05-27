import { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useWalletBalances } from "@my-org/store";
import {
  globalNetworkState,
  walletNetworkOverrideState,
} from "@repo/store/src/atoms/networkState";
import { NetworkConnectionEnum, NetworkEnum } from "@repo/store/src/enums/network";
import { getEffectiveNetworkFromStores } from "@my-org/store";
import {
  transactionHistoryState,
  transactionHistoryLoadingState,
} from "@repo/store/src/atoms/transactionHistoryState";
import { toast } from "sonner";
import { WalletAdapterFactory } from "@/app/lib/adapters/WalletAdapterFactory";
import { Wallet } from "@/app/types/wallet/wallet";
import { fetchWalletTransactionHistory } from "@/app/lib/services/transactionHistoryFetch";
import { TransactionHistoryStore } from "@api-types/TransactionTypes";

export function useWalletBalanceFetch(wallets: Wallet[]) {
  const { getBalance, setBalance } = useWalletBalances();
  const globalNetworks = useRecoilValue(globalNetworkState);
  const overrides = useRecoilValue(walletNetworkOverrideState);
  const transactionHistory = useRecoilValue(transactionHistoryState);
  const setTransactionHistory = useSetRecoilState(transactionHistoryState);
  const setLoadingStates = useSetRecoilState(transactionHistoryLoadingState);
  const [refreshingById, setRefreshingById] = useState<Record<number, boolean>>(
    {}
  );
  const fetchedWalletsRef = useRef<Set<number>>(new Set());
  const transactionHistoryRef = useRef(transactionHistory);
  
  useEffect(() => {
    transactionHistoryRef.current = transactionHistory;
  }, [transactionHistory]);

  const fetchTransactionsForWallet = useCallback(
    async (wallet: Wallet, cluster: NetworkEnum) => {
      try {
        const adapter = WalletAdapterFactory.create(wallet.type);
        await fetchWalletTransactionHistory({
          walletId: wallet.id,
          publicKey: wallet.publicKey,
          cluster,
          adapter,
          setTransactionHistory,
          setLoadingStates,
          currentHistory: transactionHistoryRef.current as TransactionHistoryStore,
        });
      } catch (error: unknown) {
        console.error(
          `Error fetching transactions for wallet ${wallet.id}:`,
          error
        );
      }
    },
    [setTransactionHistory, setLoadingStates]
  );

  const fetchBalanceForWallet = useCallback(
    async (
      wallet: Wallet,
      options: {
        showLoading?: boolean;
        forceRefresh?: boolean;
        fetchTransactions?: boolean;
      } = {}
    ) => {
      const {
        showLoading = false,
        forceRefresh = false,
        fetchTransactions = false,
      } = options;

      try {
        if (showLoading) {
          setRefreshingById((p) => ({ ...p, [wallet.id]: true }));
        }

        const adapter = WalletAdapterFactory.create(wallet.type);
        const chain = adapter.chain;
        const currentNetwork = getEffectiveNetworkFromStores(
          chain,
          wallet.id,
          globalNetworks,
          overrides
        );

        const cachedBalance = getBalance(
          wallet.id,
          wallet.type,
          currentNetwork
        );

        if (
          !forceRefresh &&
          cachedBalance &&
          cachedBalance !== "0" &&
          cachedBalance !== BigInt(0)
        ) {
          return;
        }

        const balance = await adapter.fetchBalance({
          chain,
          cluster: currentNetwork,
          address: wallet.publicKey,
        });

        if (balance !== undefined && balance !== null) {
          setBalance(wallet.id, wallet.type, balance.toString(), currentNetwork);
        }

        if (fetchTransactions) {
          void fetchTransactionsForWallet(wallet, currentNetwork);
        }
      } catch (error: unknown) {
        console.error(`Error fetching balance for wallet ${wallet.id}:`, error);
        const message =
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message: unknown }).message === "string"
            ? (error as { message: string }).message
            : "";
        if (message.includes(NetworkConnectionEnum.NoInternet)) {
          if (showLoading) {
            toast.warning(
              "Refresh failed, please check your internet connection"
            );
          }
        } else if (showLoading) {
          toast.error("Error fetching balance");
        }
      } finally {
        if (showLoading) {
          setTimeout(
            () => setRefreshingById((p) => ({ ...p, [wallet.id]: false })),
            800
          );
        }
      }
    },
    [getBalance, setBalance, globalNetworks, overrides, fetchTransactionsForWallet]
  );

  const refresh = useCallback(
    async (wallet: Wallet) => {
      await fetchBalanceForWallet(wallet, {
        showLoading: true,
        forceRefresh: true,
        fetchTransactions: true,
      });
    },
    [fetchBalanceForWallet]
  );

  const refreshBalanceQuietly = useCallback(
    async (wallet: Wallet) => {
      await fetchBalanceForWallet(wallet, {
        showLoading: false,
        forceRefresh: true,
        fetchTransactions: false,
      });
    },
    [fetchBalanceForWallet]
  );

  useEffect(() => {
    wallets.forEach((wallet) => {
      if (!fetchedWalletsRef.current.has(wallet.id)) {
        fetchedWalletsRef.current.add(wallet.id);
        fetchBalanceForWallet(wallet, {
          showLoading: false,
          forceRefresh: false,
          fetchTransactions: false,
        });
      }
    });
  }, [wallets, fetchBalanceForWallet]);

  return {
    getBalance,
    refreshingById,
    refresh,
    refreshBalanceQuietly,
  };
}
