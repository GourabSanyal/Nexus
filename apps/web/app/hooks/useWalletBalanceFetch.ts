import { useCallback, useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import { useWalletBalances, useNetwork } from "@my-org/store";
import { NetworkConnectionEnum } from "@repo/store/src/enums/network";
import { transactionHistoryState } from "@repo/store/src/atoms/transactionHistoryState";
import { toast } from "sonner";
import { WalletAdapterFactory } from "@/app/lib/adapters/WalletAdapterFactory";
import { Wallet } from "@/app/types/wallet/wallet";

export function useWalletBalanceFetch(wallets: Wallet[]) {
  const { getBalance, setBalance } = useWalletBalances();
  const { getEffectiveNetwork } = useNetwork();
  const setTransactionHistory = useSetRecoilState(transactionHistoryState);
  const [refreshingById, setRefreshingById] = useState<Record<number, boolean>>(
    {}
  );
  const fetchedWalletsRef = useRef<Set<number>>(new Set());

  const fetchTransactionsForWallet = useCallback(
    async (wallet: Wallet, network: string) => {
      try {
        const adapter = WalletAdapterFactory.create(wallet.type);
        const clusterString = network.toLowerCase();

        const response = await adapter.fetchTransactions({
          address: wallet.publicKey,
          cluster: network,
          limit: 20,
        });

        const fetchedTransactions = response.transactions || [];

        setTransactionHistory((prev) => ({
          ...prev,
          [wallet.id.toString()]: {
            ...(prev[wallet.id.toString()] || {}),
            [clusterString]: fetchedTransactions,
          },
        }));
      } catch (error: unknown) {
        console.error(
          `Error fetching transactions for wallet ${wallet.id}:`,
          error
        );
      }
    },
    [setTransactionHistory]
  );

  const fetchBalanceForWallet = useCallback(
    async (
      wallet: Wallet,
      options: { showLoading?: boolean; forceRefresh?: boolean; fetchTransactions?: boolean } = {}
    ) => {
      const { showLoading = false, forceRefresh = false, fetchTransactions = false } = options;

      try {
        if (showLoading) {
          setRefreshingById((p) => ({ ...p, [wallet.id]: true }));
        }

        const adapter = WalletAdapterFactory.create(wallet.type);
        const chain = adapter.chain;
        const currentNetwork = getEffectiveNetwork(chain, wallet.id);

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

        // When requested, also fetch and cache transactions in background
        // Don't await - let animation stop after balance is fetched
        if (fetchTransactions) {
          fetchTransactionsForWallet(wallet, currentNetwork);
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
    [getBalance, setBalance, getEffectiveNetwork, fetchTransactionsForWallet]
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
