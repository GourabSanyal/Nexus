"use client";

import { useMemo } from "react";
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
import { WalletAdapterFactory } from "@/app/lib/adapters/WalletAdapterFactory";
import { ChainEnum } from "@my-org/store";

const HistoryModal = ({ isOpen, onClose, walletId }: HistoryModalProps) => {
  const {
    wallet,
    currentCluster,
    currentTransactions,
    loading,
    isRefreshing,
    handleClusterToggle,
    handleRefresh,
  } = useTransactionHistory({ walletId, isOpen });

  const chain = useMemo(() => {
    if (!wallet) return null;
    const adapter = WalletAdapterFactory.create(wallet.type);
    return adapter.chain;
  }, [wallet]);

  if (!wallet || !chain) {
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
                onClick={() => {
                  if (chain === ChainEnum.Ethereum) {
                    console.log("🔄 [ETH UI] Button clicked - Refresh request sent from HistoryModal");
                  }
                  handleRefresh();
                }}
                disabled={isRefreshing || loading}
                className="h-8 w-8"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <TransactionHistorySkeleton count={5} />
          ) : currentTransactions.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No transactions yet.
            </div>
          ) : (
            <div className="space-y-3">
              {(() => {
                if (chain === ChainEnum.Ethereum && currentTransactions.length > 0) {
                  console.log("🎨 [ETH UI] Rendering transactions in HistoryModal", {
                    count: currentTransactions.length,
                    transactions: currentTransactions,
                    cluster: currentCluster,
                  });
                }
                return currentTransactions.map((tx) => (
                  <TransactionItem
                    key={tx.signature}
                    transaction={tx}
                    cluster={currentCluster}
                    chain={chain}
                    currencySymbol={wallet?.type === "ethereum" ? "ETH" : "SOL"}
                  />
                ));
              })()}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryModal;
