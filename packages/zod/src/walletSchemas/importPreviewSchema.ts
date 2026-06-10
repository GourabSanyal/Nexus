import { z } from "zod";

export const derivationSchemeSchema = z.enum([
  "standard",
  "nexus",
  "nexusLegacy",
]);

export const importCandidateSchema = z.object({
  chain: z.enum(["solana", "ethereum"]),
  address: z.string(),
  derivationPath: z.string(),
  scheme: derivationSchemeSchema,
  accountIndex: z.number(),
});

export const importPreviewTransactionSchema = z.object({
  signature: z.string(),
  slot: z.number(),
  block_time: z.number().nullable(),
  status: z.string(),
  err: z.unknown().nullable(),
  confirmation_status: z.string().nullable(),
  amount: z.number().nullable(),
  fee: z.number().nullable(),
  direction: z.string().nullable(),
  from_address: z.string().nullable(),
  to_address: z.string().nullable(),
  memo: z.string().nullable(),
});

export const walletImportEntrySchema = z.object({
  address: z.string(),
  derivationPath: z.string(),
  scheme: derivationSchemeSchema,
  accountIndex: z.number(),
  balance: z.string(),
  transactions: z.array(importPreviewTransactionSchema),
  hasActivity: z.boolean(),
});

export const networkImportDataSchema = z.object({
  wallets: z.array(walletImportEntrySchema),
});

export const chainImportDataSchema = z.object({
  mainnet: networkImportDataSchema,
  devnet: networkImportDataSchema,
});

export const walletImportPreviewSchema = z.object({
  solana: chainImportDataSchema,
  ethereum: chainImportDataSchema,
});

export const walletImportPreviewRequestSchema = z.object({
  candidates: z.array(importCandidateSchema).min(1),
});

export type DerivationScheme = z.infer<typeof derivationSchemeSchema>;
export type ImportCandidate = z.infer<typeof importCandidateSchema>;
export type WalletImportEntry = z.infer<typeof walletImportEntrySchema>;
export type WalletImportPreview = z.infer<typeof walletImportPreviewSchema>;
export type WalletImportPreviewRequest = z.infer<
  typeof walletImportPreviewRequestSchema
>;
