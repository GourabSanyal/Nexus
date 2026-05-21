"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../dialog/dialog";
import { ClusterToggle } from "../sections/header/ClusterToggle";
import { TransactionHistorySkeleton } from "../../loading";
import { RefreshCw } from "lucide-react";
import { Button } from "../../button/button";
import { useTransactionHistory } from "./hooks/useTransactionHistory";
import { TransactionItem } from "./components/TransactionItem";
import { HistoryModalProps } from "@/app/types/components/HistoryModalProps";
const listItemTransition = { duration: 0.28, ease: [0.25, 0.1, 0.25, 1] as const };

const HistoryModal = ({ isOpen, onClose, walletId, onRefreshBalance }: HistoryModalProps) => {
  const {
    wallet,
    adapter,
    chain,
    currentCluster,
    currentTransactions,
    loading,
    isRefreshing,
    hasCachedList,
    handleClusterToggle,
    handleRefresh,
  } = useTransactionHistory({ walletId, isOpen, onRefreshBalance });

  if (!wallet || !chain || !adapter) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <div className="flex items-center justify-between">
            <div className="pt-[0.7vh] text-left">
              <DialogTitle>Transaction History</DialogTitle>
              <DialogDescription className="pt-[1vh]">
                View transaction history for this wallet
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <ClusterToggle
                chain={chain}
                walletId={walletId}
                onToggle={handleClusterToggle}
                currentNetwork={currentCluster}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing || loading}
                className="h-8 w-8"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing || loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {loading && !hasCachedList ? (
            <TransactionHistorySkeleton count={5} />
          ) : currentTransactions.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No transactions yet.
            </div>
          ) : (
            <motion.div layout className="flex flex-col gap-3">
              <AnimatePresence initial={false} mode="popLayout">
                {currentTransactions.map((tx) => (
                  <motion.div
                    key={tx.signature}
                    layout
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={listItemTransition}
                    className="overflow-hidden"
                  >
                    <TransactionItem
                      transaction={tx}
                      cluster={currentCluster}
                      adapter={adapter}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryModal;
