import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../card/card";
import { useWalletOperations } from "@my-org/store";

import WalletHeader from "./sections/WalletHeader";
import ReceiveModal from "./modals/ReceiveModal";
import SendModal from "./modals/SendModal";
import HistoryModal from "./modals/HistoryModal";
import WalletMainSection from "./sections/WalletMainSection";
import { useWalletBalances } from "@my-org/store";
import { WalletRendererProps } from "@/app/types/wallet";

export const WalletRenderer = ({ wallets }: WalletRendererProps) => {
  const { editWalletName, deleteWallet } = useWalletOperations();
  const [receiveOpenById, setReceiveOpenById] = useState<Record<number, boolean>>({});
  const [sendOpenById, setSendOpenById] = useState<Record<number, boolean>>({});
  const [refreshingById, setRefreshingById] = useState<Record<number, boolean>>({});
  const [historyOpenById, setHistoryOpenById] = useState<Record<number, boolean>>({});
  const { getBalance } = useWalletBalances();

  const openReceive = (id: number) => setReceiveOpenById((p) => ({ ...p, [id]: true }));
  const closeReceive = (id: number) => setReceiveOpenById((p) => ({ ...p, [id]: false }));
  const openSend = (id: number) => setSendOpenById((p) => ({ ...p, [id]: true }));
  const closeSend = (id: number) => setSendOpenById((p) => ({ ...p, [id]: false }));
  const refresh = (id: number) => {
    setRefreshingById((p) => ({ ...p, [id]: true }));
    setTimeout(() => setRefreshingById((p) => ({ ...p, [id]: false })), 800);
  };
  const openHistory = (id: number) => setHistoryOpenById((p) => ({ ...p, [id]: true }));
  const closeHistory = (id: number) => setHistoryOpenById((p) => ({ ...p, [id]: false }));

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
      style={{ overflow: 'hidden' }}
    >
      <Card className="w-full mb-6 border border-border rounded-lg shadow-sm transition-shadow hover:shadow-lg bg-card text-card-foreground">
        <WalletHeader
          wallet={wallet}
          balance={getBalance(wallet.id, wallet.type)}
          isRefreshing={!!refreshingById[wallet.id]}
          onRefresh={() => refresh(wallet.id)}
          onEditName={(newName: string) => editWalletName(wallet.id, newName, wallet.type)}
          onDelete={() => deleteWallet(wallet.id, wallet.type)}
        />
        <WalletMainSection
          wallet={wallet}
          onReceive={openReceive}
          onSend={openSend}
          onHistory={openHistory}
        />

        <ReceiveModal
          isOpen={!!receiveOpenById[wallet.id]}
          onClose={() => closeReceive(wallet.id)}
          publicKey={wallet.publicKey}
        />
        <SendModal
          isOpen={!!sendOpenById[wallet.id]}
          onClose={() => closeSend(wallet.id)}
          chain={wallet.type}
          walletId={wallet.id}
          network={wallet.type}
        />
        <HistoryModal
          isOpen={!!historyOpenById[wallet.id]}
          onClose={() => closeHistory(wallet.id)}
          walletId={wallet.id}
        />
      </Card>
    </motion.div>
      ))}
      </motion.div>
    </AnimatePresence>
  );
};
