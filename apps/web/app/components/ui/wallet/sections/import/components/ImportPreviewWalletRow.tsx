import React from "react";
import { Check } from "lucide-react";
import type { ImportPreviewWalletRowProps } from "@/app/types/components/ImportPreviewTypes";

export const ImportPreviewWalletRow: React.FC<ImportPreviewWalletRowProps> = ({
  wallet,
  isSelected,
  onToggle,
}) => (
  <button
    type="button"
    aria-pressed={isSelected}
    onClick={() => onToggle(wallet.id)}
    className={`w-full rounded-lg border p-4 text-left transition-colors ${
      isSelected
        ? "border-primary bg-primary/5"
        : "border-gray-200 dark:border-gray-700 hover:border-primary/40"
    }`}
  >
    <div className="flex items-start gap-3">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
          isSelected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-gray-300 dark:border-gray-600"
        }`}
      >
        {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
      </span>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{wallet.chainLabel}</span>
          <span
            className={`rounded-full border px-2 py-0.5 text-xs ${wallet.networkColorClass}`}
          >
            {wallet.networkLabel}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {wallet.schemeLabel}
          </span>
        </div>

        <p className="truncate font-mono text-sm text-gray-700 dark:text-gray-300">
          {wallet.formattedAddress}
        </p>

        <p
          className="text-sm text-gray-600 dark:text-gray-400"
          title={wallet.usdTitle}
        >
          Balance: {wallet.formattedBalance} {wallet.currencySymbol}
          {wallet.formattedUsd ? ` · ${wallet.formattedUsd}` : null}
        </p>
      </div>
    </div>
  </button>
);
