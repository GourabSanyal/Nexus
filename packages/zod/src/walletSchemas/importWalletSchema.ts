import { validateMnemonic } from "bip39";
import { z } from "zod";
import {
  flatImportWalletEntrySchema,
  walletImportPreviewSchema,
} from "./importPreviewSchema";
import { walletSchema } from "./walletSchema";

export const SEED_PHRASE_LENGTHS = [12, 24] as const;
export type SeedPhraseLength = (typeof SEED_PHRASE_LENGTHS)[number];

export const seedPhraseLengthSchema = z.union([
  z.literal(12),
  z.literal(24),
]);

export const seedPhraseWordSchema = z
  .string()
  .transform((str) => str.trim().toLowerCase())
  .refine((val) => !val || /^[a-z]+$/.test(val), {
    message: "Word must contain only letters",
  });

export const createEmptySeedPhraseWords = (
  length: SeedPhraseLength
): string[] => Array.from({ length }, () => "");

export const seedPhraseSchema = z.object({
  seedPhraseLength: seedPhraseLengthSchema.default(12),
  seedPhraseWords: z.array(seedPhraseWordSchema),
});

export const importWalletInputSchema = z
  .object({
    seedPhrase: z.string().optional().default(""),
    seedPhraseLength: seedPhraseLengthSchema.default(12),
    seedPhraseWords: z
      .array(seedPhraseWordSchema)
      .default(() => createEmptySeedPhraseWords(12)),
    privateKey: z.string().optional().default(""),
    password: z.string().optional().default(""),
  })
  .superRefine((data, ctx) => {
    const { seedPhraseLength, seedPhraseWords } = data;

    if (seedPhraseWords.length !== seedPhraseLength) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["seedPhraseWords"],
        message: `Seed phrase must contain exactly ${seedPhraseLength} words`,
      });
      return;
    }

    const allFilled = seedPhraseWords.every((word) => word.length > 0);
    if (!allFilled) {
      return;
    }

    const mnemonic = seedPhraseWords.join(" ");
    if (!validateMnemonic(mnemonic)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["seedPhraseWords"],
        message: "Invalid seed phrase. Check spelling and word order.",
      });
    }
  });

export const importWalletSchema = z.object({
  isImporting: z.boolean().default(false),
  currentPhase: z
    .enum(["input", "validation", "confirmation", "complete"])
    .default("input"),
  inputData: importWalletInputSchema.default(() => ({
    seedPhrase: "",
    seedPhraseLength: 12 as SeedPhraseLength,
    seedPhraseWords: createEmptySeedPhraseWords(12),
    privateKey: "",
    password: "",
  })),
  validationErrors: z.array(z.string()).default([]),
  discoveredWallets: walletImportPreviewSchema.optional(),
  selectedImportWallets: z.array(flatImportWalletEntrySchema).default([]),
  importedWallet: walletSchema.partial().optional(),
});

export type ImportWalletSchema = z.infer<typeof importWalletSchema>;
