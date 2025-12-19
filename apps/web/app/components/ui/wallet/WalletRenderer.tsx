import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../card/card";
import { useWalletOperations, useNetwork } from "@my-org/store";
import { NetworkConnectionEnum } from "@repo/store/src/enums/network";

import { useWalletBalances } from "@my-org/store";
import { WalletRendererProps } from "@/app/types/wallet";
import { Wallet } from "@/app/types/wallet/wallet";
import { toast } from "sonner";
import { WalletRendererContent } from "./WalletRendererContent";
import { WalletAdapterFactory } from "@/app/lib/adapters/WalletAdapterFactory";

export const WalletRenderer = ({ wallets }: WalletRendererProps) => {
  const { editWalletName, deleteWallet } = useWalletOperations();
  const [receiveOpenById, setReceiveOpenById] = useState<
    Record<number, boolean>
  >({});
  const [sendOpenById, setSendOpenById] = useState<Record<number, boolean>>({});
  const [refreshingById, setRefreshingById] = useState<Record<number, boolean>>(
    {}
  );
  const [historyOpenById, setHistoryOpenById] = useState<
    Record<number, boolean>
  >({});
  const { getBalance, setBalance } = useWalletBalances();
  const { getEffectiveNetwork } = useNetwork();
  const fetchedWalletsRef = useRef<Set<number>>(new Set());

  const openReceive = (id: number) =>
    setReceiveOpenById((p) => ({ ...p, [id]: true }));
  const closeReceive = (id: number) =>
    setReceiveOpenById((p) => ({ ...p, [id]: false }));
  const openSend = (id: number) =>
    setSendOpenById((p) => ({ ...p, [id]: true }));
  const closeSend = (id: number) =>
    setSendOpenById((p) => ({ ...p, [id]: false }));

  const fetchBalanceForWallet = useCallback(async (wallet: Wallet, showLoading: boolean = false) => {
    try {
      if (showLoading) {
        setRefreshingById((p) => ({ ...p, [wallet.id]: true }));
      }

      const adapter = WalletAdapterFactory.create(wallet.type);
      const chain = adapter.chain;
      const currentNetwork = getEffectiveNetwork(chain, wallet.id);

      // Check if balance is already cached
      const cachedBalance = getBalance(wallet.id, wallet.type, currentNetwork);
      
      // Only fetch if no cached balance exists or if explicitly refreshing
      if (!showLoading && cachedBalance && cachedBalance !== "0" && cachedBalance !== BigInt(0)) {
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
    } catch (error: any) {
      console.error(`Error fetching balance for wallet ${wallet.id}:`, error);
      if (error?.message?.includes(NetworkConnectionEnum.NoInternet)) {
        if (showLoading) {
          toast.warning("Refresh failed, please check your internet connection");
        }
      } else {
        if (showLoading) {
          toast.error("Error fetching balance");
        }
      }
    } finally {
      if (showLoading) {
        setTimeout(
          () => setRefreshingById((p) => ({ ...p, [wallet.id]: false })),
          800
        );
      }
    }
  }, [getBalance, setBalance, getEffectiveNetwork]);

  const refresh = useCallback(async (wallet: Wallet) => {
    await fetchBalanceForWallet(wallet, true);
  }, [fetchBalanceForWallet]);

  // Auto-fetch balances on mount for wallets that don't have cached balances
  useEffect(() => {
    wallets.forEach((wallet) => {
      // Only fetch once per wallet mount
      if (!fetchedWalletsRef.current.has(wallet.id)) {
        fetchedWalletsRef.current.add(wallet.id);
        fetchBalanceForWallet(wallet, false);
      }
    });
  }, [wallets, fetchBalanceForWallet]);
  const openHistory = (id: number) =>
    setHistoryOpenById((p) => ({ ...p, [id]: true }));
  const closeHistory = (id: number) =>
    setHistoryOpenById((p) => ({ ...p, [id]: false }));

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.div layout>
        {wallets.map((wallet) => (
          <motion.div
            layout
            key={wallet.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.28 }}
            style={{ overflow: "hidden" }}
          >
            <Card className="w-full mb-6 border border-border rounded-lg shadow-sm transition-shadow hover:shadow-lg bg-card text-card-foreground">
              <WalletRendererContent
                wallet={wallet}
                getBalance={getBalance}
                isRefreshing={!!refreshingById[wallet.id]}
                onRefresh={() => refresh(wallet)}
                onEditName={(newName: string) =>
                  editWalletName(wallet.id, newName, wallet.type)
                }
                onDelete={() => deleteWallet(wallet.id, wallet.type)}
                onReceive={openReceive}
                onSend={openSend}
                onHistory={openHistory}
                receiveOpenById={receiveOpenById}
                sendOpenById={sendOpenById}
                historyOpenById={historyOpenById}
                closeReceive={closeReceive}
                closeSend={closeSend}
                closeHistory={closeHistory}
              />
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
