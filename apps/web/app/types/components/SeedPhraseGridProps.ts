import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { ImportWalletSchema } from "@repo/zod/src/walletSchemas/importWalletSchema";
import type { SeedPhraseFieldError } from "./SeedPhraseErrorsProps";

export interface SeedPhraseGridProps {
  setValue: UseFormSetValue<ImportWalletSchema>;
  watch: UseFormWatch<ImportWalletSchema>;
  handleKeyDown: (e: React.KeyboardEvent, index: number) => void;
  handlePaste: (e: React.ClipboardEvent) => void;
  wordCount: number;
  individualErrors: (SeedPhraseFieldError | undefined)[];
  inputErrors: { [key: number]: boolean };
  onError: (hasError: boolean, index: number) => void;
}
