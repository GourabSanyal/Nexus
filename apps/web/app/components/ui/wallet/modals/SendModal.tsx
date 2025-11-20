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
import { validateAddress } from "@my-org/store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";
import { ClusterToggle } from "../sections/header/ClusterToggle";
import { useSendModal } from "./hooks/useSendModal";

import { SendModalProps } from "@/app/types/wallet";

const SendModal = ({
  isOpen,
  onClose,
  chain,
  walletId,
  network,
}: SendModalProps) => {
  const {
    wallet,
    currentNetwork,
    balance,
    handleNetworkToggle,
    chainEnum,
  } = useSendModal({ walletId, chain });

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
  
  const balanceNumber = useMemo(() => {
    if (!balance) return 0;
    return typeof balance === "string" ? Number(balance) : Number(balance);
  }, [balance]);
  
  const isAmountValid =
    Number.isFinite(amountNumber) &&
    amountNumber > 0 &&
    amountNumber <= balanceNumber;
  const isAmountTooHigh =
    Number.isFinite(amountNumber) && amountNumber > balanceNumber;

  if (!wallet) {
    return null;
  }

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
              chain={chainEnum}
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
            Balance: {balanceNumber}
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
                {isAddressValid
                  ? "Address looks valid"
                  : "Wallet address is not valid"}
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
