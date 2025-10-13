"use client";

import { CardTitle } from "../../../card/card";
import { WalletTitleProps } from "@/app/types/wallet/WalletTitleTypes";

export function WalletTitle({ name }: WalletTitleProps) {
  return <CardTitle className="text-md font-semibold">{name}</CardTitle>;
}
