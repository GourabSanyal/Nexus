export type SupportedChain = "solana" | "ethereum";

const ETHEREUM_REGEX = /^0x[a-fA-F0-9]{40}$/;
const SOLANA_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function validateAddress(chain: SupportedChain, address: string): boolean {
  if (!address) return false;
  const trimmed = address.trim();
  if (chain === "ethereum") return ETHEREUM_REGEX.test(trimmed);
  return SOLANA_REGEX.test(trimmed);
}


