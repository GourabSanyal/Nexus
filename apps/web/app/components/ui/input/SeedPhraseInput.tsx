import React, { useState } from "react";
import { SeedPhraseInputProps } from "@/app/types/components/SeedPhraseInputProps";

const SeedPhraseInput = ({
  index,
  setValue,
  watch,
  error,
  onKeyDown,
  onError,
}: SeedPhraseInputProps) => {
  const seedPhraseWords = watch("inputData.seedPhraseWords") ?? [];
  const currentValue = seedPhraseWords[index] ?? "";

  const [hasInvalidInput, setHasInvalidInput] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.toLowerCase();
    const hasInvalidChars = /[^a-z]/.test(rawValue);
    setHasInvalidInput(hasInvalidChars);
    onError?.(hasInvalidChars, index);

    const currentWords = watch("inputData.seedPhraseWords");
    if (Array.isArray(currentWords)) {
      const newWords = [...currentWords];
      newWords[index] = rawValue; // using rawValue to preserve the invalid input
      setValue(
        "inputData",
        {
          ...watch("inputData"),
          seedPhraseWords: newWords,
        },
        {
          shouldValidate: true,
        }
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Backspace",
        "Delete",
      ].includes(e.key)
    ) {
      e.stopPropagation();
      return;
    }
    onKeyDown?.(e, index);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={currentValue}
        className={`
          w-full 
          px-3 
          py-2 
          text-sm 
          border 
          rounded-md 
          focus:outline-none 
          focus:ring-2 
          ${error || hasInvalidInput ? "border-red-500 dark:border-red-500" : "border-gray-200 dark:border-gray-700"}
          bg-white dark:bg-gray-900 
          ${error || hasInvalidInput ? "focus:ring-red-500 dark:focus:ring-red-500" : "focus:ring-blue-500 dark:focus:ring-blue-400"}
          transition-colors
        `}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
      />
      <div className="absolute -top-2 left-2 px-1 text-xs text-gray-500 bg-white dark:bg-gray-900">
        {index + 1}
      </div>
    </div>
  );
};

export default SeedPhraseInput;
