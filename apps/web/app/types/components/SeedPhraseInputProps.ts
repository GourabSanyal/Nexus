import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { ImportWalletSchema } from "@repo/zod/src/walletSchemas/importWalletSchema";

export interface SeedPhraseInputProps {
  index: number;
  setValue: UseFormSetValue<ImportWalletSchema>;
  watch: UseFormWatch<ImportWalletSchema>;
  error?: boolean;
  onPaste?: React.ComponentProps<"input">["onPaste"];
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
  onError?: (hasError: boolean, index: number) => void;
}