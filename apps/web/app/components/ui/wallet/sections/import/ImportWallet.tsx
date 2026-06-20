"use client";

import React from "react";
import { FormProvider } from "react-hook-form";
import { useRecoilValue } from "recoil";
import { importWalletState } from "@repo/store/src/atoms/importWalletState";
import { ImportWalletHeader } from "./components/ImportWalletHeader";
import { ImportPreview } from "./components/ImportPreview";
import { SeedPhraseForm } from "./components/SeedPhraseForm";
import { ImportWalletSessionProvider } from "./ImportWalletSessionContext";
import { useImportPreview } from "./hooks/useImportPreview";
import { useImportWalletForm } from "./hooks/useImportWalletForm";
import { hasImportSessionKey } from "@/app/lib/utils/import/importSessionStorage";

type ImportWalletProps = {
  onBack?: () => void;
  isBackDisabled?: boolean;
};

const ImportWalletContent = ({ onBack, isBackDisabled }: ImportWalletProps) => {
  const { currentPhase, validationErrors, isImporting } =
    useRecoilValue(importWalletState);
  const {
    methods,
    handleKeyDown,
    handlePaste,
    handleSeedPhraseLengthChange,
    onSubmit,
  } = useImportWalletForm();

  const {
    walletViews,
    selectedIds,
    toggleWallet,
    selectAll,
    clearSelection,
    handleConfirm,
    isConfirmDisabled,
    isPersisting,
  } = useImportPreview();

  const pendingSession = hasImportSessionKey();
  const showPreview = currentPhase === "confirmation";
  const backDisabled = isBackDisabled || isImporting;
  const isRestoringPreview =
    pendingSession && currentPhase !== "confirmation";

  if (isRestoringPreview) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-4 py-12 text-center text-sm text-muted-foreground">
        Restoring wallet import…
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="flex flex-col items-center gap-4">
        {validationErrors.length > 0 ? (
          <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {validationErrors[0]}
          </div>
        ) : null}
        <ImportPreview
          wallets={walletViews}
          selectedIds={selectedIds}
          onToggleWallet={toggleWallet}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          onConfirm={handleConfirm}
          isConfirmDisabled={isConfirmDisabled}
          isPersisting={isPersisting}
        />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col items-center gap-4">
        <ImportWalletHeader onBack={onBack} backDisabled={backDisabled} />
        {validationErrors.length > 0 ? (
          <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {validationErrors[0]}
          </div>
        ) : null}
        <SeedPhraseForm
          handleKeyDown={handleKeyDown}
          handlePaste={handlePaste}
          onSeedPhraseLengthChange={handleSeedPhraseLengthChange}
        />
      </form>
    </FormProvider>
  );
};

const ImportWallet = (props: ImportWalletProps) => (
  <ImportWalletSessionProvider>
    <ImportWalletContent {...props} />
  </ImportWalletSessionProvider>
);

export default ImportWallet;
