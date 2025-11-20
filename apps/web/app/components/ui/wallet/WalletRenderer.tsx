import { useState } from "react";
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

  const openReceive = (id: number) =>
    setReceiveOpenById((p) => ({ ...p, [id]: true }));
  const closeReceive = (id: number) =>
    setReceiveOpenById((p) => ({ ...p, [id]: false }));
  const openSend = (id: number) =>
    setSendOpenById((p) => ({ ...p, [id]: true }));
  const closeSend = (id: number) =>
    setSendOpenById((p) => ({ ...p, [id]: false }));

  const refresh = async (wallet: Wallet) => {
    try {
      setRefreshingById((p) => ({ ...p, [wallet.id]: true }));

      const adapter = WalletAdapterFactory.create(wallet.type);
      const chain = adapter.chain;
      const currentNetwork = getEffectiveNetwork(chain, wallet.id);

      const balance = await adapter.fetchBalance({
        chain,
        cluster: currentNetwork,
        address: wallet.publicKey,
      });

      if (balance !== undefined && balance !== null) {
        setBalance(wallet.id, wallet.type, balance.toString(), currentNetwork);
      }
    } catch (error: any) {
      if (error?.message?.includes(NetworkConnectionEnum.NoInternet)) {
        toast.warning("Refresh failed, please check your internet connection");
      } else {
        toast.error("Error fetching balance");
      }
    } finally {
      setTimeout(
        () => setRefreshingById((p) => ({ ...p, [wallet.id]: false })),
        800
      );
    }
  };
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
