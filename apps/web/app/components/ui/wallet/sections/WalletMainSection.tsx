import { CardContent } from "../../card/card";
import { Button } from "../../button/button";
import { Copy, Eye, EyeOff } from "lucide-react";
import type { PublicEthereumWallet, PublicSolanaWallet } from "@my-org/zod";
import { copyToClipboard } from "@/app/lib/utils/clipboard";
import ReceiveButton from "../actions/ReceiveButton";
import SendButton from "../actions/SendButton";
import HistoryButton from "../actions/HistoryButton";
import { Dialog } from "../../dialog/dialog";
import { useState, useCallback, useEffect } from "react";
import WarningModal from "@components/ui/wallet/sections/password/WarningModal";
import PasswordInput from "./password/PasswordInput";
import { useWalletVault } from "@/app/lib/contexts/WalletVaultContext";
import { toast } from "sonner";

type Wallet = PublicSolanaWallet | PublicEthereumWallet;

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
  const [passwordDialogOpen, setPasswordDialogOpen] = useState<boolean>(false);
  const vault = useWalletVault();

  useEffect(() => {
    if (!vault.isUnlocked) {
      setIsPrivateVisible(false);
    }
  }, [vault.isUnlocked]);

  const resolvedPrivateKey = vault.getPrivateKey(wallet.id, wallet.type);

  const handleTogglePrivate = useCallback(() => {
    if (isPrivateVisible) {
      setIsPrivateVisible(false);
      return;
    }

    if (!vault.isUnlocked) {
      toast.error("Unlock your wallet to view the private key");
      return;
    }

    setWarnOpen(true);
  }, [isPrivateVisible, vault.isUnlocked]);

  const confirmViewPrivate = useCallback(() => {
    setWarnOpen(false);
    setPasswordDialogOpen(true);
  }, []);

  const onPrivateKeyPasswordSubmit = async ({
    password,
  }: {
    password: string;
  }) => {
    const valid = await vault.verifyPassword(password);
    if (!valid) {
      toast.error("Incorrect password");
      return;
    }

    setIsPrivateVisible(true);
    setPasswordDialogOpen(false);
  };

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
          <code className="text-xs text-muted-foreground">
            {wallet.publicKey}
          </code>
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
              onOpenChange={(open) => {
                if (!open) {
                  setWarnOpen(false);
                }
              }}
            >
              <WarningModal onClick={confirmViewPrivate} />
            </Dialog>
            <Dialog
              open={passwordDialogOpen}
              onOpenChange={(open) => {
                setPasswordDialogOpen(open);
                if (!open) {
                  setIsPrivateVisible(false);
                }
              }}
            >
              <PasswordInput onSubmit={onPrivateKeyPasswordSubmit} />
            </Dialog>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              disabled={!isPrivateVisible || !resolvedPrivateKey}
              onClick={() => {
                if (resolvedPrivateKey) {
                  copyToClipboard(resolvedPrivateKey, "private key");
                }
              }}
            >
              <Copy className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="bg-muted p-3 rounded-md overflow-x-auto">
          <code className="text-xs text-muted-foreground">
            {isPrivateVisible && resolvedPrivateKey
              ? resolvedPrivateKey
              : "••••••••••••••••"}
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
};
