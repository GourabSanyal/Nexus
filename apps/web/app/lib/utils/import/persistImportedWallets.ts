import type {
  FlatImportWalletEntry,
  PublicEthereumWallet,
  PublicSolanaWallet,
  WalletPublicSchema,
} from "@my-org/zod";
import type { VaultWalletEntry } from "@/app/lib/crypto/walletVault";
import type { KeyedImportCandidate } from "./deriveImportCandidates";
import { dedupeImportSelections } from "./dedupeImportSelections";
import { importAddressesMatch } from "./importAddressMatch";
import { matchKeyedImportCandidate } from "./matchKeyedImportCandidate";

export type PersistImportedWalletsInput = {
  mnemonic: string;
  selected: FlatImportWalletEntry[];
  keyed: KeyedImportCandidate[];
  existing: Pick<WalletPublicSchema, "solanaWallets" | "ethereumWallets">;
};

export type PersistImportedWalletsResult = {
  publicState: WalletPublicSchema;
  vaultEntries: VaultWalletEntry[];
  mnemonic: string;
};

const walletExists = (
  entry: FlatImportWalletEntry,
  solanaWallets: PublicSolanaWallet[],
  ethereumWallets: PublicEthereumWallet[]
): boolean => {
  if (entry.chain === "solana") {
    return solanaWallets.some((wallet) =>
      importAddressesMatch(wallet.publicKey, entry.address, "solana")
    );
  }

  return ethereumWallets.some((wallet) =>
    importAddressesMatch(wallet.publicKey, entry.address, "ethereum")
  );
};

const resolveActiveTab = (
  imported: FlatImportWalletEntry[]
): "solana" | "ethereum" => {
  const hasSolana = imported.some((entry) => entry.chain === "solana");
  const hasEthereum = imported.some((entry) => entry.chain === "ethereum");

  if (hasSolana && !hasEthereum) {
    return "solana";
  }
  if (hasEthereum && !hasSolana) {
    return "ethereum";
  }

  return imported[0]?.chain ?? "solana";
};

export const persistImportedWallets = ({
  mnemonic,
  selected,
  keyed,
  existing,
}: PersistImportedWalletsInput): PersistImportedWalletsResult => {
  const solanaWallets = [...(existing.solanaWallets ?? [])];
  const ethereumWallets = [...(existing.ethereumWallets ?? [])];
  const vaultEntries: VaultWalletEntry[] = [];
  const imported: FlatImportWalletEntry[] = [];

  for (const entry of dedupeImportSelections(selected)) {
    if (walletExists(entry, solanaWallets, ethereumWallets)) {
      continue;
    }

    const keyedCandidate = matchKeyedImportCandidate(entry, keyed);
    if (!keyedCandidate) {
      throw new Error(
        `Missing private key for ${entry.chain} wallet ${entry.address}`
      );
    }

    const id = Date.now() + imported.length;
    vaultEntries.push({
      id,
      chain: entry.chain,
      privateKey: keyedCandidate.privateKey,
      path: entry.derivationPath,
    });

    if (entry.chain === "solana") {
      solanaWallets.push({
        id,
        name: `Solana Wallet ${solanaWallets.length + 1}`,
        publicKey: entry.address,
        type: "solana",
        path: entry.derivationPath,
      });
    } else {
      ethereumWallets.push({
        id,
        name: `Ethereum Wallet ${ethereumWallets.length + 1}`,
        publicKey: entry.address,
        type: "ethereum",
        path: entry.derivationPath,
      });
    }

    imported.push(entry);
  }

  if (imported.length === 0) {
    throw new Error("No new wallets to import. Selected wallets may already exist.");
  }

  return {
    mnemonic,
    vaultEntries,
    publicState: {
      solanaWallets,
      ethereumWallets,
      activeTab: resolveActiveTab(imported),
    },
  };
};
