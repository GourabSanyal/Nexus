import type { PublicEthereumWallet, PublicSolanaWallet } from "@repo/zod";

export type Wallet = PublicSolanaWallet | PublicEthereumWallet;
