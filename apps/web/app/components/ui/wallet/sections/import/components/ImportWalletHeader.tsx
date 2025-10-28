import React from "react";
import { Button } from "../../../../button/button";
import { ArrowLeft } from "lucide-react";

interface ImportWalletHeaderProps {
  onBack?: () => void;
}

export const ImportWalletHeader: React.FC<ImportWalletHeaderProps> = ({
  onBack,
}) => (
  <>
    <div className="flex items-center gap-4 w-full max-w-md">
      {onBack && (
        <Button
          onClick={onBack}
          variant="ghost"
          size="icon"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      <h2 className="text-2xl font-bold flex-1 text-center">Import Wallet</h2>
      <div className="w-10"></div>
    </div>
    <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
      Enter your 12-word seed phrase to import your wallet
    </p>
  </>
);
