import type { ImportCandidate } from "@my-org/zod";

export const parseImportBalance = (
  _chain: ImportCandidate["chain"],
  balance: string
): bigint => {
  const trimmed = balance.trim();
  if (!trimmed || trimmed === "0" || trimmed === "0x" || trimmed === "0x0") {
    return 0n;
  }

  if (trimmed.startsWith("0x")) {
    try {
      return BigInt(trimmed);
    } catch {
      return 0n;
    }
  }

  try {
    return BigInt(trimmed);
  } catch {
    return 0n;
  }
};
