import React from "react";
import { Button } from "@components/ui/button/button";
import { ArrowLeft } from "lucide-react";
import type { ImportPreviewProps } from "@/app/types/components/ImportPreviewTypes";
import { ImportPreviewWalletRow } from "./ImportPreviewWalletRow";

export const ImportPreview: React.FC<ImportPreviewProps> = ({
  wallets,
  selectedIds,
  onToggleWallet,
  onSelectAll,
  onClearSelection,
  onConfirm,
  onBack,
  isConfirmDisabled,
  isPersisting = false,
}) => (
  <div className="flex w-full max-w-md flex-col gap-6">
    <div className="flex items-center gap-4">
      <Button
        onClick={onBack}
        variant="ghost"
        size="icon"
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        type="button"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h2 className="flex-1 text-center text-2xl font-bold">Select Wallets</h2>
      <div className="w-10" />
    </div>

    <p className="text-center text-gray-600 dark:text-gray-400">
      Choose wallets with on-chain activity to import. Only active wallets are
      shown.
    </p>

    {wallets.length === 0 ? (
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
        No wallets with activity were found for this seed phrase.
      </div>
    ) : (
      <>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            className="flex-1 text-sm"
            onClick={onSelectAll}
          >
            Select all
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="flex-1 text-sm"
            onClick={onClearSelection}
          >
            Clear
          </Button>
        </div>

        <div className="flex max-h-[24rem] flex-col gap-3 overflow-y-auto">
          {wallets.map((wallet) => (
            <ImportPreviewWalletRow
              key={wallet.id}
              wallet={wallet}
              isSelected={selectedIds.includes(wallet.id)}
              onToggle={onToggleWallet}
            />
          ))}
        </div>
      </>
    )}

    <Button
      type="button"
      className={`w-full px-4 py-2 text-sm font-medium ${
        isConfirmDisabled
          ? "cursor-not-allowed bg-gray-400 opacity-50 dark:bg-gray-600"
          : ""
      }`}
      disabled={isConfirmDisabled}
      onClick={onConfirm}
    >
      {isPersisting
        ? "Importing..."
        : `Continue with ${selectedIds.length} wallet${
            selectedIds.length === 1 ? "" : "s"
          }`}
    </Button>
  </div>
);
