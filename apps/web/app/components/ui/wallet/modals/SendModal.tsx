"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../dialog/dialog";
import { Button } from "../../button/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "../../input";
import { useState, useMemo } from "react";
import { useWalletBalances, validateAddress } from "@my-org/store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  chain: "solana" | "ethereum";
  walletId: number;
  network: "solana" | "ethereum";
}

const SendModal = ({ isOpen, onClose, chain, walletId, network }: SendModalProps) => {
  const { getBalance } = useWalletBalances();
  const balance = getBalance(walletId, network);
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const amountNumber = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? n : NaN;
  }, [amount]);
  const isAddressValid = useMemo(() => {
    if (!recipient) return false;
    return validateAddress(chain, recipient);
  }, [recipient, chain]);
  const isAmountValid =
    Number.isFinite(amountNumber) &&
    amountNumber > 0 &&
    amountNumber <= balance;
  const isAmountTooHigh =
    Number.isFinite(amountNumber) && amountNumber > balance;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="paste">
          <TabsList className="grid grid-cols-3 w-full">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="cursor-not-allowed"
                  >
                    <TabsTrigger value="scan" disabled>Scan QR</TabsTrigger>
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
                  <span
                    className="cursor-not-allowed"
                  >
                    <TabsTrigger value="import" disabled>Import Image</TabsTrigger>
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
            Balance: {balance}
          </div>
          <div className="space-y-1">
            <Input
              placeholder={`Recipient ${chain === "solana" ? "SOL" : "ETH"} address`}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value.trim())}
              className={`${recipient ? (isAddressValid ? "border-green-600" : "border-destructive text-destructive placeholder:text-destructive/70") : ""}`}
            />
            {recipient && (
              <div className={`text-xs ${isAddressValid ? "text-green-600" : "text-destructive"}`}>
                {isAddressValid ? "Address looks valid" : "Wallet address is not valid"}
              </div>
            )}
          </div>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="Amount"
            value={amount}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || /^\d*(?:\.|\d+)?\d*$/.test(v)) {
                setAmount(v);
              }
            }}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            className={`${isAmountTooHigh ? "border-destructive text-destructive placeholder:text-destructive/70" : ""}`}
          />
          <Button
            className="w-full disabled:bg-gray-700 disabled:text-gray-400 disabled:opacity-70"
            disabled={!isAmountValid || !isAddressValid}
          >
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendModal;
