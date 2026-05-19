import React from "react";
import { useFormContext } from "react-hook-form";
import type { ImportWalletSchema } from "@repo/zod/src/walletSchemas/importWalletSchema";
import { SeedPhraseGrid } from "./SeedPhraseGrid";
import { SeedPhraseErrors } from "./SeedPhraseErrors";
import { ImportButton } from "./ImportButton";

interface SeedPhraseFormProps {
  handleKeyDown: (e: React.KeyboardEvent, index: number) => void;
}

export const SeedPhraseForm: React.FC<SeedPhraseFormProps> = ({
  handleKeyDown,
}) => {
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");

    // Split by spaces, commas, or newlines and clean up
    const words = pastedText
      .toLowerCase()
      .replace(/[\n,]+/g, " ") // replace newlines and commas with spaces
      .split(" ")
      .filter((word) => word.trim().length > 0) // remove if value is empty
      .slice(0, 12); // takes only first 12 words

    if (words.length > 0) {
      setValue(
        "inputData",
        {
          ...watch("inputData"),
          seedPhraseWords: Array(12)
            .fill("")
            .map((_, i) => words[i] || ""),
        },
        {
          shouldValidate: true,
        }
      );
    }
  };
  const [isImporting, setIsImporting] = React.useState(false);
  const {
    formState: { errors },
    watch,
    setValue,
    handleSubmit,
  } = useFormContext<ImportWalletSchema>();

  const handleImport = async (data: ImportWalletSchema) => {
    setIsImporting(true);
    // temporary - simulating import process with setTimeout
    await new Promise((resolve) => setTimeout(resolve, 2000));
    void data;
    setIsImporting(false);
  };

  const inputData = watch("inputData");
  const seedPhraseWords = inputData?.seedPhraseWords ?? [];
  const isComplete =
    seedPhraseWords.length === 12 &&
    seedPhraseWords.every((word) => word?.length > 0);

  const rawValidationErrors = errors.inputData?.seedPhraseWords;
  const validationErrors = rawValidationErrors || null;

  const individualErrors = (() => {
    if (!rawValidationErrors) return [];
    if (Array.isArray(rawValidationErrors)) {
      return rawValidationErrors.map((error) =>
        error ? { message: error.message, type: error.type } : undefined
      );
    }
    return [
      { message: rawValidationErrors.message, type: rawValidationErrors.type },
    ];
  })();

  const [inputErrors, setInputErrors] = React.useState<{
    [key: number]: boolean;
  }>({});

  const handleInputError = (hasError: boolean, index: number) => {
    setInputErrors((prev) => ({
      ...prev,
      [index]: hasError,
    }));
  };

  const numberErrors = seedPhraseWords
    .map((word, idx) => {
      if (word && /[^a-z]/.test(word.toLowerCase())) {
        return {
          index: idx,
          message: "Numbers or special characters are not allowed",
        };
      }
      return null;
    })
    .filter(
      (error): error is { index: number; message: string } => error !== null
    );

  return (
    <div className="w-full max-w-md flex flex-col gap-6">
      <SeedPhraseGrid
        setValue={setValue}
        watch={watch}
        handleKeyDown={handleKeyDown}
        handlePaste={handlePaste}
        individualErrors={individualErrors}
        inputErrors={inputErrors}
        onError={handleInputError}
      />

      <ImportButton
        isImporting={isImporting}
        isComplete={isComplete}
        hasValidationErrors={Boolean(validationErrors)}
        hasIndividualErrors={individualErrors.length > 0}
        hasNumberErrors={numberErrors.length > 0}
        seedPhraseLength={seedPhraseWords.length}
        onSubmit={async () => await handleSubmit(handleImport)()}
      />

      <SeedPhraseErrors
        validationErrors={validationErrors}
        individualErrors={individualErrors}
        numberErrors={numberErrors}
        seedPhraseWords={seedPhraseWords}
      />
    </div>
  );
};
