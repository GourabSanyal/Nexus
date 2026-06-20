import React, { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Button } from "@components/ui/button/button";
import { ImportButtonProps } from "@/app/types/components/ImportButtonProps";

const LoadingLabel = ({ text }: { text: string }) => (
  <>
    <span
      className="mr-2 inline-block h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    {text}
  </>
);

export const ImportButton = ({
  isImporting,
  isComplete,
  hasValidationErrors,
  hasIndividualErrors,
  hasNumberErrors,
  expectedWordCount,
}: ImportButtonProps) => {
  const [isPending, setIsPending] = useState(false);
  const showLoading = isImporting || isPending;

  useEffect(() => {
    if (!isImporting) {
      setIsPending(false);
    }
  }, [isImporting]);

  const canSubmit =
    isComplete &&
    !hasValidationErrors &&
    !hasIndividualErrors &&
    !hasNumberErrors;

  const handleClick = () => {
    if (!canSubmit || showLoading) {
      return;
    }

    flushSync(() => {
      setIsPending(true);
    });
  };

  return (
    <Button
      type="submit"
      onClick={handleClick}
      className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
        ${
          !canSubmit || showLoading
            ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50 hover:bg-gray-400 dark:hover:bg-gray-600 text-white"
            : "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/20"
        } ${showLoading ? "cursor-wait" : ""}`}
      disabled={!canSubmit}
      aria-busy={showLoading}
      aria-disabled={showLoading || !canSubmit}
    >
      {showLoading ? (
        <LoadingLabel text="Importing..." />
      ) : (
        `Import ${expectedWordCount}-word wallet`
      )}
    </Button>
  );
};
