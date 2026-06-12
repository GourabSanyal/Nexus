import { z } from "zod";

export const publicSolanaWalletSchema = z.object({
  id: z.number(),
  name: z.string(),
  publicKey: z.string(),
  type: z.literal("solana"),
  path: z.string().optional(),
});

export const publicEthereumWalletSchema = z.object({
  id: z.number(),
  name: z.string(),
  publicKey: z.string(),
  type: z.literal("ethereum"),
  path: z.string().optional(),
});

export const walletPublicSchema = z.object({
  solanaWallets: z.array(publicSolanaWalletSchema).optional(),
  ethereumWallets: z.array(publicEthereumWalletSchema).optional(),
  activeTab: z.enum(["solana", "ethereum"]).optional(),
});

export type PublicSolanaWallet = z.infer<typeof publicSolanaWalletSchema>;
export type PublicEthereumWallet = z.infer<typeof publicEthereumWalletSchema>;
export type WalletPublicSchema = z.infer<typeof walletPublicSchema>;
