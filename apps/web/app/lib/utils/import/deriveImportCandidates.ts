import { mnemonicToSeed, validateMnemonic } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { HDNodeWallet } from "ethers";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";

export const DEFAULT_MAX_ACCOUNTS = 5;
export const MAX_ACCOUNTS_CAP = 10;

export type DerivationScheme = "standard" | "nexus" | "nexusLegacy";
export type ImportChain = "solana" | "ethereum";

export type ImportCandidate = {
  chain: ImportChain;
  address: string;
  derivationPath: string;
  scheme: DerivationScheme;
  accountIndex: number;
};

export type KeyedImportCandidate = ImportCandidate & {
  privateKey: string;
};

export type DeriveImportCandidatesResult = {
  candidates: ImportCandidate[];
  keyed: KeyedImportCandidate[];
};

export const clampMaxAccounts = (maxAccounts?: number): number =>
  Math.min(Math.max(maxAccounts ?? DEFAULT_MAX_ACCOUNTS, 1), MAX_ACCOUNTS_CAP);

const deriveSolanaKeypair = (seed: Buffer, path: string): KeyedImportCandidate => {
  const derivedSeed = derivePath(path, seed.toString("hex")).key;
  const secret = nacl.sign.keyPair.fromSeed(new Uint8Array(derivedSeed)).secretKey;
  const keypair = Keypair.fromSecretKey(new Uint8Array(secret));

  return {
    chain: "solana",
    address: keypair.publicKey.toBase58(),
    derivationPath: path,
    scheme: "standard",
    accountIndex: 0,
    privateKey: Buffer.from(keypair.secretKey).toString("base64"),
  };
};

const deriveEthereumWallet = (
  seed: Buffer,
  path: string,
  scheme: DerivationScheme,
  accountIndex: number
): KeyedImportCandidate => {
  const hdNode = HDNodeWallet.fromSeed(new Uint8Array(seed));
  const child = hdNode.derivePath(path);

  return {
    chain: "ethereum",
    address: child.address.toLowerCase(),
    derivationPath: path,
    scheme,
    accountIndex,
    privateKey: child.privateKey,
  };
};

const dedupeCandidates = (
  keyed: KeyedImportCandidate[]
): DeriveImportCandidatesResult => {
  const seen = new Set<string>();
  const candidates: ImportCandidate[] = [];
  const uniqueKeyed: KeyedImportCandidate[] = [];

  for (const entry of keyed) {
    const key = `${entry.chain}:${entry.address}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    const { privateKey: _privateKey, ...candidate } = entry;
    candidates.push(candidate);
    uniqueKeyed.push(entry);
  }

  return { candidates, keyed: uniqueKeyed };
};

export const deriveImportCandidates = async (
  mnemonic: string,
  maxAccounts?: number
): Promise<DeriveImportCandidatesResult> => {
  const normalized = mnemonic.trim().toLowerCase();
  if (!validateMnemonic(normalized)) {
    throw new Error("Invalid seed phrase. Check spelling and word order.");
  }

  const wordCount = normalized.split(/\s+/).length;
  if (wordCount !== 12 && wordCount !== 24) {
    throw new Error("Seed phrase must be 12 or 24 words.");
  }

  const seed = await mnemonicToSeed(normalized);
  const accountLimit = clampMaxAccounts(maxAccounts);
  const keyed: KeyedImportCandidate[] = [];

  for (let accountIndex = 0; accountIndex < accountLimit; accountIndex += 1) {
    const solPath = `m/44'/501'/${accountIndex}'/0'`;
    keyed.push({
      ...deriveSolanaKeypair(seed, solPath),
      scheme: "standard",
      accountIndex,
    });

    const ethStandardPath = `m/44'/60'/${accountIndex}'/0/0`;
    keyed.push(
      deriveEthereumWallet(seed, ethStandardPath, "standard", accountIndex)
    );

    const ethNexusPath = `m/44'/60'/${accountIndex}'/0'`;
    keyed.push(
      deriveEthereumWallet(seed, ethNexusPath, "nexus", accountIndex)
    );
  }

  keyed.push({
    ...deriveSolanaKeypair(seed, "m/44'/501'/0'"),
    scheme: "nexusLegacy",
    accountIndex: 0,
  });

  keyed.push(
    deriveEthereumWallet(seed, "m/44'/60'/60'/0'", "nexusLegacy", 0)
  );

  return dedupeCandidates(keyed);
};
