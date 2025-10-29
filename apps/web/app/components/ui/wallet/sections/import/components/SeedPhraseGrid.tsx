import React from "react";
import SeedPhraseInput from "@components/ui/input/SeedPhraseInput";
import { SeedPhraseGridProps } from "@/app/types/components/SeedPhraseGridProps";

export const SeedPhraseGrid = ({
  setValue,
  watch,
  handleKeyDown,
  handlePaste,
  individualErrors,
  inputErrors,
  onError,
}: SeedPhraseGridProps) => {
  return (
    <div className="grid grid-cols-3 gap-4" onPaste={handlePaste}>
      {Array(12)
        .fill(0)
        .map((_, index) => (
          <SeedPhraseInput
            key={index}
            index={index}
            setValue={setValue}
            watch={watch}
            onKeyDown={handleKeyDown}
            error={!!individualErrors[index]?.message || inputErrors[index]}
            onError={onError}
          />
        ))}
    </div>
  );
};
