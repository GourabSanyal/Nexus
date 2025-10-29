import React from 'react';
import { FormProvider } from "react-hook-form";
import { ImportWalletHeader } from './components/ImportWalletHeader';
import { SeedPhraseForm } from './components/SeedPhraseForm';
import { useImportWalletForm } from './hooks/useImportWalletForm';

type ImportWalletProps = {
  onBack?: () => void;
}

const ImportWallet = ({ onBack }: ImportWalletProps) => {
  const { methods, handleKeyDown, onSubmit } = useImportWalletForm();

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col items-center gap-4">
        <ImportWalletHeader onBack={onBack} />
        <SeedPhraseForm
          handleKeyDown={handleKeyDown}
        />
      </form>
    </FormProvider>
  );
}

export default ImportWallet;