import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../card/card";
import { useWalletOperations } from "@my-org/store";
import { WalletRendererProps } from "@/app/types/wallet";
import { WalletRendererContent } from "./WalletRendererContent";
import { usePerWalletModalState } from "@/app/hooks/usePerWalletModalState";
import { useWalletBalanceFetch } from "@/app/hooks/useWalletBalanceFetch";

export const WalletRenderer = ({ wallets }: WalletRendererProps) => {
  const { editWalletName, deleteWallet } = useWalletOperations();
  const {
    receiveOpenById,
    sendOpenById,
    historyOpenById,
    openReceive,
    closeReceive,
    openSend,
    closeSend,
    openHistory,
    closeHistory,
  } = usePerWalletModalState();
  const { getBalance, refreshingById, refresh } =
    useWalletBalanceFetch(wallets);

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
