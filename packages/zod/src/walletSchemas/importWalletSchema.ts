import { z } from "zod";
import { walletSchema } from "./walletSchema";

export const importWalletSchema = z.object({
    isImporting: z.boolean(),
    currentPhase: z.enum(['input', 'validation', 'confirmation', 'complete']),
    inputData: z.object({
        seedPhrase: z.string().optional(),
        privateKey: z.string().optional(),
        password: z.string().optional(),
    }),
    validationErrors: z.array(z.string()),
    importedWallet: walletSchema.partial().optional(),
});

export type ImportWalletSchema = z.infer<typeof importWalletSchema>;