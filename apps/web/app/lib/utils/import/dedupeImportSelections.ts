import type { FlatImportWalletEntry } from "@my-org/zod";

export const dedupeImportSelections = (
  selected: FlatImportWalletEntry[]
): FlatImportWalletEntry[] => {
  const seen = new Set<string>();

  return selected.filter((entry) => {
    const key = `${entry.chain}:${entry.address}:${entry.derivationPath}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};
