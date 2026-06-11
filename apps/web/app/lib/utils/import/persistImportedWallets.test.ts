import { describe, expect, it } from "vitest";
import type { FlatImportWalletEntry } from "@my-org/zod";
import type { KeyedImportCandidate } from "./deriveImportCandidates";
import { persistImportedWallets } from "./persistImportedWallets";

const solEntry = (
  address: string,
  networkTier: "mainnet" | "devnet" = "devnet"
): FlatImportWalletEntry => ({
  chain: "solana",
  networkTier,
  address,
  derivationPath: "m/44'/501'/0'/0'",
  scheme: "standard",
  accountIndex: 0,
  balance: "1000",
  transactions: [],
  hasActivity: true,
});

const keyedSol = (address: string): KeyedImportCandidate => ({
  chain: "solana",
  address,
  derivationPath: "m/44'/501'/0'/0'",
  scheme: "standard",
  accountIndex: 0,
  privateKey: "c2VjcmV0",
});

describe("persistImportedWallets", () => {
  it("persists mnemonic and selected wallets", () => {
    const result = persistImportedWallets({
      mnemonic: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
      selected: [solEntry("ActiveSol")],
      keyed: [keyedSol("ActiveSol")],
      existing: { solanaWallets: [], ethereumWallets: [] },
    });

    expect(result.mnemonicState).toContain("abandon");
    expect(result.solanaWallets).toHaveLength(1);
    expect(result.solanaWallets[0]?.publicKey).toBe("ActiveSol");
    expect(result.solanaWallets[0]?.path).toBe("m/44'/501'/0'/0'");
    expect(result.activeTab).toBe("solana");
  });

  it("dedupes the same wallet across network tiers", () => {
    const result = persistImportedWallets({
      mnemonic: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
      selected: [
        solEntry("ActiveSol", "mainnet"),
        solEntry("ActiveSol", "devnet"),
      ],
      keyed: [keyedSol("ActiveSol")],
      existing: { solanaWallets: [], ethereumWallets: [] },
    });

    expect(result.solanaWallets).toHaveLength(1);
  });

  it("throws when private keys are missing", () => {
    expect(() =>
      persistImportedWallets({
        mnemonic: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
        selected: [solEntry("ActiveSol")],
        keyed: [],
        existing: { solanaWallets: [], ethereumWallets: [] },
      })
    ).toThrow(/missing private key/i);
  });
});
