"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../dialog/dialog";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletId: number;
}

const HistoryModal = ({ isOpen, onClose }: HistoryModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transaction History</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          {/* Placeholder list; wire actual tx data later */}
          No transactions yet.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryModal;


