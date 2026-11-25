import type { FlatImportWalletEntry } from "@repo/zod";

export const buildImportWalletEntryId = (
  entry: Pick<
    FlatImportWalletEntry,
    "chain" | "networkTier" | "address" | "derivationPath"
  >
): string =>
  `${entry.chain}:${entry.networkTier}:${entry.address}:${entry.derivationPath}`;
