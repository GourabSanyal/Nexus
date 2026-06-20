import type {
  FlatImportWalletEntry,
  WalletImportEntry,
  WalletImportPreview,
} from "@my-org/zod";

const CHAINS = ["solana", "ethereum"] as const;
const NETWORK_TIERS = ["mainnet", "devnet"] as const;

const normalizeAddress = (
  chain: FlatImportWalletEntry["chain"],
  address: string
): string => (chain === "ethereum" ? address.toLowerCase() : address);

const walletIdentityKey = (
  chain: FlatImportWalletEntry["chain"],
  wallet: WalletImportEntry
): string =>
  `${chain}:${normalizeAddress(chain, wallet.address)}:${wallet.derivationPath}:${wallet.scheme}`;

const balanceValue = (entry: Pick<WalletImportEntry, "balance">): bigint => {
  const balance = entry.balance.trim();
  if (!balance || balance === "0" || balance === "0x" || balance === "0x0") {
    return 0n;
  }

  try {
    return BigInt(balance);
  } catch {
    return 0n;
  }
};

/** True when the wallet has a non-zero balance and/or at least one transaction. */
export const walletHasOnChainActivity = (
  entry: Pick<WalletImportEntry, "hasActivity" | "balance" | "transactions">
): boolean => {
  if (entry.transactions.length > 0) {
    return true;
  }

  if (balanceValue(entry) > 0n) {
    return true;
  }

  return entry.hasActivity;
};

const pickDisplayTier = (
  tiers: FlatImportWalletEntry[]
): FlatImportWalletEntry => {
  const activeTiers = tiers.filter(walletHasOnChainActivity);
  const candidates = activeTiers.length > 0 ? activeTiers : tiers;

  return candidates.reduce((best, tier) => {
    const bestScore =
      (walletHasOnChainActivity(best) ? 1_000 : 0) +
      (best.networkTier === "devnet" ? 100 : 0) +
      best.transactions.length +
      Number(balanceValue(best) > 0n);

    const tierScore =
      (walletHasOnChainActivity(tier) ? 1_000 : 0) +
      (tier.networkTier === "devnet" ? 100 : 0) +
      tier.transactions.length +
      Number(balanceValue(tier) > 0n);

    return tierScore >= bestScore ? tier : best;
  });
};

const mergeWalletEntries = (
  existing: FlatImportWalletEntry,
  incoming: FlatImportWalletEntry
): FlatImportWalletEntry => {
  const tiers = [existing, incoming];
  const displayTier = pickDisplayTier(tiers);
  const activeTiers = tiers.filter(walletHasOnChainActivity);

  const transactions = tiers.reduce(
    (best, tier) =>
      tier.transactions.length > best.length ? tier.transactions : best,
    [] as WalletImportEntry["transactions"]
  );

  const balance = (activeTiers.length > 0 ? activeTiers : tiers).reduce(
    (best, tier) => (balanceValue(tier) > balanceValue(best) ? tier : best)
  ).balance;

  return {
    ...displayTier,
    balance,
    transactions,
    hasActivity: walletHasOnChainActivity({
      hasActivity: tiers.some((tier) => tier.hasActivity),
      balance,
      transactions,
    }),
  };
};

const compareEntries = (
  a: FlatImportWalletEntry,
  b: FlatImportWalletEntry
): number => {
  if (a.chain !== b.chain) {
    return a.chain.localeCompare(b.chain);
  }

  return a.accountIndex - b.accountIndex;
};

/**
 * Flatten the nested import preview into one row per derived wallet that has
 * on-chain activity on any scanned network (mainnet or devnet).
 */
export const flattenImportPreview = (
  preview: WalletImportPreview
): FlatImportWalletEntry[] => {
  const byIdentity = new Map<string, FlatImportWalletEntry>();

  for (const chain of CHAINS) {
    for (const networkTier of NETWORK_TIERS) {
      for (const wallet of preview[chain][networkTier].wallets) {
        const entry: FlatImportWalletEntry = {
          ...wallet,
          chain,
          networkTier,
        };
        const key = walletIdentityKey(chain, wallet);
        const existing = byIdentity.get(key);

        byIdentity.set(
          key,
          existing ? mergeWalletEntries(existing, entry) : entry
        );
      }
    }
  }

  return Array.from(byIdentity.values())
    .filter(walletHasOnChainActivity)
    .sort(compareEntries);
};
