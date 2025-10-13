import { CardContent } from "../../card/card";
import { Button } from "../../button/button";
import { Copy, Eye, EyeOff } from "lucide-react";
import { SolanaWallet, EthereumWallet } from "@my-org/zod";
import { copyToClipboard } from "@/app/lib/utils/clipboard";
import ReceiveButton from "../actions/ReceiveButton";
import SendButton from "../actions/SendButton";
import HistoryButton from "../actions/HistoryButton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../dialog/dialog";
import { useState, useCallback } from "react";

type Wallet = SolanaWallet | EthereumWallet;

export interface WalletMainSectionProps {
  wallet: Wallet;
  onReceive?: (walletId: number) => void;
  onSend?: (walletId: number) => void;
  onHistory?: (walletId: number) => void;
}

export default function WalletMainSection({
  wallet,
  onReceive,
  onSend,
  onHistory,
}: WalletMainSectionProps) {
  const [isPrivateVisible, setIsPrivateVisible] = useState<boolean>(false);
  const [warnOpen, setWarnOpen] = useState<boolean>(false);

  const handleTogglePrivate = useCallback(() => {
    if (isPrivateVisible) {
      setIsPrivateVisible(false);
      return;
    }
    setWarnOpen(true);
  }, [isPrivateVisible]);

  const confirmViewPrivate = useCallback(() => {
    setIsPrivateVisible(true);
    setWarnOpen(false);
  }, []);

  return (
    <CardContent>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">
            Public Key:
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => copyToClipboard(wallet.publicKey, "public key")}
          >
            <Copy className="h-5 w-5" />
          </Button>
        </div>
        <div className="bg-muted p-3 rounded-md overflow-x-auto">
          <code className="text-xs text-muted-foreground">{wallet.publicKey}</code>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">
            Private Key:
          </span>
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleTogglePrivate}
            >
              {isPrivateVisible ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </Button>
            <Dialog
              open={warnOpen}
              onOpenChange={(open) => !open && setWarnOpen(false)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">Warning</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Sharing your private key with anyone might risk your funds. Are you sure you want to view it?
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end">
                  <DialogClose asChild>
                    <Button
                      onClick={confirmViewPrivate}
                      className="py-2 px-4 bg-destructive text-destructive-foreground font-semibold rounded-lg hover:bg-destructive/90 transition-colors duration-300"
                    >
                      View Private Key
                    </Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => copyToClipboard(wallet.privateKey, "private key")}
            >
              <Copy className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="bg-muted p-3 rounded-md overflow-x-auto">
          <code className="text-xs text-muted-foreground">
            {isPrivateVisible ? wallet.privateKey : "••••••••••••••••"}
          </code>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <ReceiveButton onClick={() => onReceive?.(wallet.id)} />
          <SendButton onClick={() => onSend?.(wallet.id)} />
          <HistoryButton onClick={() => onHistory?.(wallet.id)} />
        </div>
      </div>
    </CardContent>
  );
}


