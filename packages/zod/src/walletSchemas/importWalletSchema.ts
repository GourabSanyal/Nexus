import { z } from "zod";
import { walletSchema } from "./walletSchema";

export const seedPhraseWordSchema = z.string()
  .transform(str => str.trim())
  .refine(val => !val || /^[a-zA-Z]+$/.test(val), {
    message: 'Word must contain only letters'
  });

export const seedPhraseSchema = z.object({
  seedPhraseWords: z.array(seedPhraseWordSchema)
    .length(12, 'Seed phrase must contain exactly 12 words')
    .default(Array(12).fill('')),
});

export const importWalletSchema = z.object({
    isImporting: z.boolean().default(false),
    currentPhase: z.enum(['input', 'validation', 'confirmation', 'complete']).default('input'),
    inputData: z.object({
        seedPhrase: z.string().optional().default(''),
        seedPhraseWords: z.array(seedPhraseWordSchema)
          .length(12, 'Seed phrase must contain exactly 12 words')
          .optional()
          .default(() => Array(12).fill('')),
        privateKey: z.string().optional().default(''),
        password: z.string().optional().default(''),
    }).default(() => ({
        seedPhrase: '',
        seedPhraseWords: Array(12).fill(''),
        privateKey: '',
        password: '',
    })),
    validationErrors: z.array(z.string()).default([]),
    importedWallet: walletSchema.partial().optional(),
});

export type ImportWalletSchema = z.infer<typeof importWalletSchema>;