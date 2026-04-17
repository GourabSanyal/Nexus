"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../dialog/dialog";
import { Button } from "../../button/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "../../input";
import { useState, useMemo } from "react";
import { formatDisplayAmount, getChainAmountDecimals } from "@my-org/store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";
import { ClusterToggle } from "../sections/header/ClusterToggle";
import { useSendModal } from "./hooks/useSendModal";
import { ChainEnum } from "@my-org/store";
import { sendTransaction } from "@/app/lib/utils/sendTransaction";
import { toast } from "sonner";
import { validateSendInput } from "@my-org/zod";

import { SendModalProps } from "@/app/types/wallet";

const SendModal = ({
  isOpen,
  onClose,
  chain,
  walletId,
  network,
}: SendModalProps) => {
  const chainEnum = chain === "solana" ? ChainEnum.Solana : ChainEnum.Ethereum;
  const {
    wallet,
    currentNetwork,
    balance,
    handleNetworkToggle,
    chainEnum: chainEnumFromHook,
  } = useSendModal({ walletId, chain: chainEnum });

  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const displayBalance = useMemo(
    () => formatDisplayAmount(balance, chain, 5),
    [balance, chain]
  );
  const maxBalance = useMemo(
    () => formatDisplayAmount(balance, chain, getChainAmountDecimals(chain)),
    [balance, chain]
  );

  const validationResult = useMemo(
    () =>
      validateSendInput({
        chain,
        recipient,
        amount,
        maxAmount: maxBalance,
      }),
    [amount, chain, maxBalance, recipient]
  );

  const fieldErrors = useMemo(() => {
    const errors = validationResult.success
      ? {}
      : validationResult.error.flatten().fieldErrors;

    return {
      recipient: errors.recipient?.[0],
      amount: errors.amount?.[0],
    };
  }, [validationResult]);

  const isAddressValid = Boolean(recipient) && !fieldErrors.recipient;
  const isAmountValid = Boolean(amount) && !fieldErrors.amount;
  const isAmountTooHigh = fieldErrors.amount === "Amount exceeds available balance";

  if (!wallet) {
    return null;
  }

  const handleSend = async () => {
    if (!isAmountValid || !isAddressValid || isSending) return;

    setIsSending(true);

    try {
      const result = await sendTransaction({
        chain: chainEnumFromHook,
        cluster: currentNetwork,
        from: wallet.publicKey,
        privateKey: wallet.privateKey,
        to: recipient,
        amount,
      });

      toast.success(`Transaction submitted: ${result.id}`);
      setRecipient("");
      setAmount("");
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Failed to send transaction");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader className="text-left">
          <div className="flex items-center justify-between">
            <div className="pt-[0.7vh] text-left">
              <DialogTitle>Send</DialogTitle>
              <DialogDescription className="pt-[1vh]">
                Send {chain === "solana" ? "SOL" : "ETH"} to another address
              </DialogDescription>
            </div>
            <ClusterToggle
              chain={chainEnumFromHook}
              walletId={walletId}
              onToggle={handleNetworkToggle}
              currentNetwork={currentNetwork}
            />
          </div>
        </DialogHeader>
        <Tabs defaultValue="paste">
          <TabsList className="grid grid-cols-3 w-full">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-not-allowed">
                    <TabsTrigger value="scan" disabled>
                      Scan QR
                    </TabsTrigger>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Coming soon...</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-not-allowed">
                    <TabsTrigger value="import" disabled>
                      Import Image
                    </TabsTrigger>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Coming soon...</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TabsTrigger value="paste">Paste</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Balance: {displayBalance}
          </div>
          <div className="space-y-1">
            <Input
              placeholder={`Recipient ${chain === "solana" ? "SOL" : "ETH"} address`}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value.trim())}
              className={`${recipient ? (isAddressValid ? "border-green-600" : "border-destructive text-destructive placeholder:text-destructive/70") : ""}`}
            />
            {recipient && (
              <div
                className={`text-xs ${isAddressValid ? "text-green-600" : "text-destructive"}`}
              >
                {isAddressValid ? "Address looks valid" : fieldErrors.recipient}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <Input
              type="text"
              inputMode="decimal"
              placeholder="Amount"
              value={amount}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || /^\d*(?:\.\d*)?$/.test(v)) {
                  setAmount(v);
                }
              }}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              className={`${amount ? (isAmountValid ? "border-green-600" : "border-destructive text-destructive placeholder:text-destructive/70") : ""}`}
            />
            {amount && fieldErrors.amount && (
              <div
                className="text-xs text-destructive"
              >
                {fieldErrors.amount}
              </div>
            )}
          </div>
          <Button
            className="w-full disabled:bg-gray-700 disabled:text-gray-400 disabled:opacity-70"
            disabled={!isAmountValid || !isAddressValid || isSending}
            onClick={handleSend}
          >
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendModal;
