import type {
  EthereumWallet,
  FlatImportWalletEntry,
  SolanaWallet,
  WalletSchema,
} from "@my-org/zod";
import type { KeyedImportCandidate } from "./deriveImportCandidates";
import { dedupeImportSelections } from "./dedupeImportSelections";
import { importAddressesMatch } from "./importAddressMatch";
import { matchKeyedImportCandidate } from "./matchKeyedImportCandidate";

export type PersistImportedWalletsInput = {
  mnemonic: string;
  selected: FlatImportWalletEntry[];
  keyed: KeyedImportCandidate[];
  existing: Pick<WalletSchema, "solanaWallets" | "ethereumWallets">;
};

export type PersistImportedWalletsResult = Pick<
  WalletSchema,
  "mnemonicState" | "solanaWallets" | "ethereumWallets" | "activeTab"
>;

const walletExists = (
  entry: FlatImportWalletEntry,
  solanaWallets: SolanaWallet[],
  ethereumWallets: EthereumWallet[]
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

    if (entry.chain === "solana") {
      solanaWallets.push({
        id,
        name: `Solana Wallet ${solanaWallets.length + 1}`,
        publicKey: entry.address,
        privateKey: keyedCandidate.privateKey,
        type: "solana",
        mnemonic,
        path: entry.derivationPath,
      });
    } else {
      ethereumWallets.push({
        id,
        name: `Ethereum Wallet ${ethereumWallets.length + 1}`,
        publicKey: entry.address,
        privateKey: keyedCandidate.privateKey,
        type: "ethereum",
        mnemonic,
        path: entry.derivationPath,
      });
    }

    imported.push(entry);
  }

  if (imported.length === 0) {
    throw new Error("No new wallets to import. Selected wallets may already exist.");
  }

  return {
    mnemonicState: mnemonic,
    solanaWallets,
    ethereumWallets,
    activeTab: resolveActiveTab(imported),
  };
};
