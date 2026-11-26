"use client";

import { BalancePillProps } from "@/app/types/wallet/BalancePillTypes";

export function BalancePill({ text, title }: BalancePillProps) {
  return (
    <span
      className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
      title={title}
    >
      {text}
    </span>
  );
}
