"use client";

import React from "react";
import {
  SEED_PHRASE_LENGTHS,
  type SeedPhraseLength,
} from "@repo/zod/src/walletSchemas/importWalletSchema";

type SeedPhraseLengthToggleProps = {
  value: SeedPhraseLength;
  onChange: (length: SeedPhraseLength) => void;
  disabled?: boolean;
};

export const SeedPhraseLengthToggle: React.FC<SeedPhraseLengthToggleProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex w-full flex-col gap-2">
      <span className="text-sm font-medium text-muted-foreground">
        Recovery phrase length
      </span>
      <div
        className="grid grid-cols-2 gap-2 rounded-lg border border-border p-1"
        role="group"
        aria-label="Seed phrase length"
      >
        {SEED_PHRASE_LENGTHS.map((length) => {
          const isActive = value === length;
          return (
            <button
              key={length}
              type="button"
              disabled={disabled}
              aria-pressed={isActive}
              onClick={() => onChange(length)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-muted-foreground hover:bg-muted"
              } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {length} words
            </button>
          );
        })}
      </div>
    </div>
  );
};
