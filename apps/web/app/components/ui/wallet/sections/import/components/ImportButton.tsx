import React from "react";
import { Button } from "@components/ui/button/button";
import { ImportButtonProps } from "@/app/types/components/ImportButtonProps";

export const ImportButton = ({
  isImporting,
  isComplete,
  hasValidationErrors,
  hasIndividualErrors,
  hasNumberErrors,
  seedPhraseLength,
  onSubmit,
}: ImportButtonProps) => {
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await onSubmit();
  };
  const isDisabled =
    isImporting ||
    !isComplete ||
    hasValidationErrors ||
    hasIndividualErrors ||
    hasNumberErrors ||
    seedPhraseLength !== 12;

  return (
    <Button
      type="submit"
      className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
        ${isDisabled
          ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50 hover:bg-gray-400 dark:hover:bg-gray-600 text-white'
          : 'bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/20'
        }`}
      onClick={handleClick}
      disabled={isDisabled}
    >
      {isImporting ? "Importing..." : "Import"}
    </Button>
  );
};