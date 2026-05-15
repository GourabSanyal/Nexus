import { useCallback, useEffect, useRef, useState } from "react";
import { useWalletBalances, useNetwork } from "@my-org/store";
import { NetworkConnectionEnum } from "@repo/store/src/enums/network";
import { toast } from "sonner";
import { WalletAdapterFactory } from "@/app/lib/adapters/WalletAdapterFactory";
import { Wallet } from "@/app/types/wallet/wallet";

export function useWalletBalanceFetch(wallets: Wallet[]) {
  const { getBalance, setBalance } = useWalletBalances();
  const { getEffectiveNetwork } = useNetwork();
  const [refreshingById, setRefreshingById] = useState<Record<number, boolean>>(
    {}
  );
  const fetchedWalletsRef = useRef<Set<number>>(new Set());

  const fetchBalanceForWallet = useCallback(
    async (wallet: Wallet, showLoading = false) => {
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
          !showLoading &&
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
    [getBalance, setBalance, getEffectiveNetwork]
  );

  const refresh = useCallback(
    async (wallet: Wallet) => {
      await fetchBalanceForWallet(wallet, true);
    },
    [fetchBalanceForWallet]
  );

  useEffect(() => {
    wallets.forEach((wallet) => {
      if (!fetchedWalletsRef.current.has(wallet.id)) {
        fetchedWalletsRef.current.add(wallet.id);
        fetchBalanceForWallet(wallet, false);
      }
    });
  }, [wallets, fetchBalanceForWallet]);

  return {
    getBalance,
    refreshingById,
    refresh,
  };
}
