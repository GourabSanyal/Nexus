"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../dialog/dialog";
import { Button } from "../../button/button";
import { Copy } from "lucide-react";
import { copyToClipboard } from "@/app/lib/utils/clipboard";

import { ReceiveModalProps } from "@/app/types/wallet/ReceiveModalProps";

const ReceiveModal = ({ isOpen, onClose, publicKey }: ReceiveModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receive</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          {/* Placeholder for QR - integrate real QR later */}
          <div className="h-40 w-40 bg-muted rounded" />
          <div className="flex items-center gap-2">
            <code className="text-xs break-all text-muted-foreground">
              {publicKey}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => copyToClipboard(publicKey, "Public key")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiveModal;
