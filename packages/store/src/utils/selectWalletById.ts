import type {
  PublicEthereumWallet,
  PublicSolanaWallet,
  WalletPublicSchema,
} from "@my-org/zod";

type WalletListSlice = Pick<WalletPublicSchema, "solanaWallets" | "ethereumWallets">;

/** Resolve a wallet by numeric id across Solana + Ethereum lists (ids are unique per app). */
export function selectWalletById(
  state: WalletListSlice,
  id: number
): PublicSolanaWallet | PublicEthereumWallet | undefined {
  const solana = state.solanaWallets ?? [];
  const ethereum = state.ethereumWallets ?? [];
  return [...solana, ...ethereum].find((w) => w.id === id);
}
