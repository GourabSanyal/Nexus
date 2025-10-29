import { AlertCircle } from "lucide-react";
import { SeedPhraseErrorsProps } from "@/app/types/components/SeedPhraseErrorsProps"

export const SeedPhraseErrors = ({
  validationErrors,
  individualErrors,
  numberErrors,
  seedPhraseWords,
}: SeedPhraseErrorsProps) => {
  if (
    !validationErrors &&
    individualErrors.length === 0 &&
    numberErrors.length === 0 &&
    !seedPhraseWords.some((word) => word && /[^a-z]/.test(word.toLowerCase()))
  ) {
    return null;
  }

  return (
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
  );
};