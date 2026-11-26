import type { FieldError, FieldErrors } from "react-hook-form";
import type { ImportWalletSchema } from "@repo/zod";

export type SeedPhraseWordsFieldError = NonNullable<
  FieldErrors<ImportWalletSchema>["inputData"]
>["seedPhraseWords"];

export type SeedPhraseFieldError = Pick<FieldError, "message" | "type">;

export interface SeedPhraseErrorsProps {
  validationErrors?: SeedPhraseWordsFieldError | null;
  individualErrors: (SeedPhraseFieldError | undefined)[];
  numberErrors: { index: number; message: string }[];
  seedPhraseWords: string[];
}
