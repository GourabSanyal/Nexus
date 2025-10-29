import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { ImportWalletSchema } from "@repo/zod/src/walletSchemas/importWalletSchema";

export interface SeedPhraseGridProps {
  setValue: UseFormSetValue<ImportWalletSchema>;
  watch: UseFormWatch<ImportWalletSchema>;
  handleKeyDown: (e: React.KeyboardEvent, index: number) => void;
  handlePaste: (e: React.ClipboardEvent) => void;
  individualErrors: any[];  // Using any to handle complex react-hook-form types
  inputErrors: { [key: number]: boolean };
  onError: (hasError: boolean, index: number) => void;
}