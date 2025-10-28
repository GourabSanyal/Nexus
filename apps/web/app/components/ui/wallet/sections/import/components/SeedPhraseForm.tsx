import React from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "../../../../button/button";
import SeedPhraseInput from "@components/ui/input/SeedPhraseInput";
import { AlertCircle } from "lucide-react";
import type { ImportWalletSchema } from "@repo/zod/src/walletSchemas/importWalletSchema";

interface SeedPhraseFormProps {
  handlePaste: (e: React.ClipboardEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent, index: number) => void;
}

export const SeedPhraseForm: React.FC<SeedPhraseFormProps> = ({
  handlePaste,
  handleKeyDown,
}) => {
  const [isImporting, setIsImporting] = React.useState(false);
  const {
    formState: { errors },
    watch,
    setValue,
    handleSubmit,
  } = useFormContext<ImportWalletSchema>();

  const handleImport = async (data: ImportWalletSchema) => {
    setIsImporting(true);
    // Simulating import process with setTimeout
    await new Promise(resolve => setTimeout(() => {
      console.log('Importing wallet with data:', data);
      resolve(true);
    }, 2000));
    setIsImporting(false);
  };

  const inputData = watch("inputData");
  const seedPhraseWords = inputData?.seedPhraseWords ?? [];
  const isComplete =
    seedPhraseWords.length === 12 &&
    seedPhraseWords.every((word) => word?.length > 0);

  const validationErrors = errors.inputData?.seedPhraseWords;
  const individualErrors = validationErrors
    ? Array.isArray(validationErrors)
      ? validationErrors
      : [validationErrors]
    : [];

  const [inputErrors, setInputErrors] = React.useState<{ [key: number]: boolean }>({});

  const handleInputError = (hasError: boolean, index: number) => {
    setInputErrors(prev => ({
      ...prev,
      [index]: hasError
    }));
  };

  // Check for numbers in seed phrase words
  const numberErrors = seedPhraseWords.map((word, idx) => {
    if (word && /[^a-z]/.test(word.toLowerCase())) {
      return { index: idx, message: "Numbers or special characters are not allowed" };
    }
    return null;
  }).filter((error): error is { index: number; message: string } => error !== null);


  return (
    <div className="w-full max-w-md flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        {Array(12)
          .fill(0)
          .map((_, index) => (
            <SeedPhraseInput
              key={index}
              index={index}
              setValue={setValue}
              watch={watch}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              error={!!individualErrors[index]?.message || inputErrors[index]}
              onError={handleInputError}
            />
          ))}
      </div>

      <Button
        type="submit"
        className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
          ${isImporting ||
          !isComplete ||
          Boolean(validationErrors) ||
          individualErrors.length > 0 ||
          numberErrors.length > 0 ||
          seedPhraseWords.length !== 12
            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50 hover:bg-gray-400 dark:hover:bg-gray-600 text-white'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/20'
          }`}
        onClick={handleSubmit(handleImport)}
        disabled={
          isImporting ||
          !isComplete ||
          Boolean(validationErrors) ||
          individualErrors.length > 0 ||
          numberErrors.length > 0 ||
          seedPhraseWords.length !== 12
        }
      >
        {isImporting ? "Importing..." : "Import"}
      </Button>

      {/* Error Messages Below Button */}
      {(Boolean(validationErrors) || individualErrors.length > 0 || numberErrors.length > 0 || seedPhraseWords.some(word => word && /[^a-z]/.test(word.toLowerCase()))) && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <AlertCircle
              className="h-5 w-5 text-red-400 dark:text-red-500"
              aria-hidden="true"
            />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Seed Phrase Errors
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <ul className="list-disc space-y-1 pl-5">
                  {/* Validation errors from Zod */}
                  {validationErrors?.message && !Array.isArray(validationErrors.message) && (
                    <li>{validationErrors.message}</li>
                  )}
                  {/* Individual field errors */}
                  {individualErrors.map((error, idx) => {
                    if (!error?.message) return null;
                    return (
                      <li key={`validation-${idx}`}>
                        Word {idx + 1}: {error.message}
                      </li>
                    );
                  })}
                  {/* Number and special character errors */}
                  {numberErrors.map((error) => (
                    <li key={`number-${error.index}`}>
                      Word {error.index + 1}: {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
