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
import {QRCode} from "@/app/components/ui/qrcode/QRCode";

import { ReceiveModalProps } from "@/app/types/wallet/ReceiveModalProps";
import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";

const ReceiveModal = ({ isOpen, onClose, publicKey, chain, network }: ReceiveModalProps) => {
  const generateQRValue = () => {
    if (chain === ChainEnum.Solana) {
      const cluster = network === NetworkEnum.Devnet ? "devnet" : "mainnet-beta";
      return `solana:${publicKey}?cluster=${cluster}`;
    } else if (chain === ChainEnum.Ethereum) {
      const chainId = network === NetworkEnum.Mainnet ? 1 : 11155111; // 11155111 is Sepolia
      return `ethereum:${publicKey}?chainId=${chainId}`;
    }
    return publicKey;
  };

  const qrValue = generateQRValue();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receive {chain === ChainEnum.Solana ? "Solana" : "Ethereum"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="px-2 py-0.5 rounded-full bg-muted text-[10px] uppercase font-bold text-muted-foreground">
            {network}
          </div>
          <QRCode
            value={qrValue} 
            size={180} 
            className="rounded-lg shadow-inner border p-2 bg-white"
          />
          <div className="flex items-center gap-2 w-full max-w-sm mt-2">
            <div className="flex-1 bg-muted/50 p-2 rounded border text-xs break-all font-mono">
              {publicKey}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground shrink-0"
              onClick={() => copyToClipboard(publicKey, "Public key")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-center text-muted-foreground px-4 italic">
            Scanning this will automatically prompt compatible wallets to use the {network} network.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiveModal;
