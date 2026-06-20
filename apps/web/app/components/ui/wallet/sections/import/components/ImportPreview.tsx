import React, { useCallback, useState } from "react";
import { flushSync } from "react-dom";
import { Button } from "@components/ui/button/button";
import type { ImportPreviewProps } from "@/app/types/components/ImportPreviewTypes";
import { ImportPreviewWalletRow } from "./ImportPreviewWalletRow";

const LoadingLabel = ({ text }: { text: string }) => (
  <>
    <span
      className="mr-2 inline-block h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    {text}
  </>
);

export const ImportPreview: React.FC<ImportPreviewProps> = ({
  wallets,
  selectedIds,
  onToggleWallet,
  onSelectAll,
  onClearSelection,
  onConfirm,
  isConfirmDisabled,
  isPersisting = false,
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const isLoading = isPersisting || isClicked;

  const handleConfirmClick = useCallback(() => {
    if (isConfirmDisabled || isLoading) {
      return;
    }

    flushSync(() => {
      setIsClicked(true);
    });

    void Promise.resolve(onConfirm()).finally(() => {
      setIsClicked(false);
    });
  }, [isConfirmDisabled, isLoading, onConfirm]);

  return (
  <div className="flex w-full max-w-md flex-col gap-6">
    <div className="flex items-center gap-4">
      <h2 className="flex-1 text-center text-2xl font-bold">Select Wallets</h2>
    </div>

    <p className="text-center text-gray-600 dark:text-gray-400">
      Choose wallets with on-chain activity to import. Only wallets with a
      balance are shown.
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
            disabled={isLoading}
          >
            Select all
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="flex-1 text-sm"
            onClick={onClearSelection}
            disabled={isLoading}
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
        isConfirmDisabled || isLoading
          ? "cursor-not-allowed bg-gray-400 opacity-50 dark:bg-gray-600"
          : ""
      }`}
      disabled={isConfirmDisabled || isLoading}
      aria-busy={isLoading}
      onClick={handleConfirmClick}
    >
      {isLoading ? (
        <LoadingLabel text="Importing..." />
      ) : (
        `Continue with ${selectedIds.length} wallet${
          selectedIds.length === 1 ? "" : "s"
        }`
      )}
    </Button>
  </div>
  );
};
