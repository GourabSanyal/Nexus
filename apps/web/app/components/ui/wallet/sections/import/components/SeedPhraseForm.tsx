import React from "react";
import { useFormContext } from "react-hook-form";
import type { ImportWalletSchema } from "@repo/zod/src/walletSchemas/importWalletSchema";
import { SeedPhraseGrid } from "./SeedPhraseGrid";
import { SeedPhraseErrors } from "./SeedPhraseErrors";
import { ImportButton } from "./ImportButton";
import { SeedPhraseLengthToggle } from "./SeedPhraseLengthToggle";

interface SeedPhraseFormProps {
  handleKeyDown: (e: React.KeyboardEvent, index: number) => void;
  handlePaste: (e: React.ClipboardEvent) => void;
  onSeedPhraseLengthChange: (length: 12 | 24) => void;
}

export const SeedPhraseForm: React.FC<SeedPhraseFormProps> = ({
  handleKeyDown,
  handlePaste,
  onSeedPhraseLengthChange,
}) => {
  const {
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<ImportWalletSchema>();

  const inputData = watch("inputData");
  const isImporting = watch("isImporting");
  const seedPhraseLength = inputData?.seedPhraseLength ?? 12;
  const seedPhraseWords = inputData?.seedPhraseWords ?? [];

  const isComplete =
    seedPhraseWords.length === seedPhraseLength &&
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
      <SeedPhraseLengthToggle
        value={seedPhraseLength}
        onChange={onSeedPhraseLengthChange}
        disabled={isImporting}
      />

      <SeedPhraseGrid
        setValue={setValue}
        watch={watch}
        handleKeyDown={handleKeyDown}
        handlePaste={handlePaste}
        wordCount={seedPhraseLength}
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
        expectedWordCount={seedPhraseLength}
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
