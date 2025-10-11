"use client";

import { Button } from "../../button/button";
import { Download } from "lucide-react";
import { WalletButtonProps } from "@/app/types/wallet/CommonWalletTypes";

interface ReceiveButtonProps extends WalletButtonProps {}

const ReceiveButton = ({ onClick }: ReceiveButtonProps) => {
  return (
    <Button onClick={onClick} className="w-full sm:w-auto">
      <Download className="inline-block mr-2 h-4 w-4" /> Receive
    </Button>
  );
};

export default ReceiveButton;
