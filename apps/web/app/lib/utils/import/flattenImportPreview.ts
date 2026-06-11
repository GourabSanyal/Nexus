import type { FlatImportWalletEntry, WalletImportPreview } from "@my-org/zod";

const CHAINS = ["solana", "ethereum"] as const;
const NETWORK_TIERS = ["mainnet", "devnet"] as const;

export const flattenImportPreview = (
  preview: WalletImportPreview
): FlatImportWalletEntry[] => {
  const entries: FlatImportWalletEntry[] = [];

  for (const chain of CHAINS) {
    for (const networkTier of NETWORK_TIERS) {
      for (const wallet of preview[chain][networkTier].wallets) {
        if (!wallet.hasActivity) {
          continue;
        }

        entries.push({
          ...wallet,
          chain,
          networkTier,
        });
      }
    }
  }

  return entries;
};
