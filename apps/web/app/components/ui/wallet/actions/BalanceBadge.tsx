"use client";

import { BalanceBadgeProps } from "@/app/types/wallet/BalanceBadgeTypes";

const BalanceBadge = ({ balanceText }: BalanceBadgeProps) => {
  return (
    <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
      {balanceText}
    </span>
  );
};

export default BalanceBadge;
