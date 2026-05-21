"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../dialog/dialog";
import { Button } from "../../button/button";
import { useState, useMemo } from "react";
import { formatDisplayAmount, getChainAmountDecimals } from "@my-org/store";
import { ClusterToggle } from "../sections/header/ClusterToggle";
import { useSendModal } from "./hooks/useSendModal";
import { sendTransaction } from "@/app/lib/utils/sendTransaction";
import { toast } from "sonner";
import { validateSendInput } from "@my-org/zod";
import { SendModalProps } from "@/app/types/wallet";
import { SendModalForm } from "./send/SendModalForm";
import { getSendErrorMessage } from "./send/getSendErrorMessage";

const SendModal = ({
  isOpen,
  onClose,
  chain,
  walletId,
}: SendModalProps) => {
  const {
    wallet,
    adapter,
    currentNetwork,
    balance,
    handleNetworkToggle,
    chainEnum: chainEnumFromHook,
  } = useSendModal({ walletId });

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

  if (!wallet || !adapter) {
    return null;
  }

  const currencySymbol = adapter.getCurrencySymbol();

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
    } catch (error: unknown) {
      toast.error(getSendErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader className="text-left">
          <div className="flex items-center justify-between">
            <SendModalTitle currencySymbol={currencySymbol} />
            <ClusterToggle
              chain={chainEnumFromHook}
              walletId={walletId}
              onToggle={handleNetworkToggle}
              currentNetwork={currentNetwork}
            />
          </div>
        </DialogHeader>
        <SendModalBody
          displayBalance={displayBalance}
          currencySymbol={currencySymbol}
          recipient={recipient}
          amount={amount}
          isAddressValid={isAddressValid}
          isAmountValid={isAmountValid}
          fieldErrors={fieldErrors}
          isSending={isSending}
          onRecipientChange={setRecipient}
          onAmountChange={setAmount}
          onSend={handleSend}
        />
      </DialogContent>
    </Dialog>
  );
};

const SendModalTitle = ({ currencySymbol }: { currencySymbol: string }) => (
  <div className="pt-[0.7vh] text-left">
    <DialogTitle>Send</DialogTitle>
    <DialogDescription className="pt-[1vh]">
      Send {currencySymbol} to another address
    </DialogDescription>
  </div>
);

const SendModalBody = ({
  displayBalance,
  currencySymbol,
  recipient,
  amount,
  isAddressValid,
  isAmountValid,
  fieldErrors,
  isSending,
  onRecipientChange,
  onAmountChange,
  onSend,
}: {
  displayBalance: string;
  currencySymbol: string;
  recipient: string;
  amount: string;
  isAddressValid: boolean;
  isAmountValid: boolean;
  fieldErrors: { recipient?: string; amount?: string };
  isSending: boolean;
  onRecipientChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onSend: () => void;
}) => (
  <div className="space-y-3">
    <div className="text-sm text-muted-foreground">Balance: {displayBalance}</div>
    <SendModalForm
      chainLabel={currencySymbol}
      recipient={recipient}
      amount={amount}
      isAddressValid={isAddressValid}
      isAmountValid={isAmountValid}
      fieldErrors={fieldErrors}
      onRecipientChange={onRecipientChange}
      onAmountChange={onAmountChange}
    />
    <Button
      className="w-full disabled:bg-gray-700 disabled:text-gray-400 disabled:opacity-70"
      disabled={!isAmountValid || !isAddressValid || isSending}
      onClick={onSend}
    >
      {isSending ? "Sending..." : "Send"}
    </Button>
  </div>
);

export default SendModal;
