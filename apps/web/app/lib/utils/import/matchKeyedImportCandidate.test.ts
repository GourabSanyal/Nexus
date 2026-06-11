import { describe, expect, it } from "vitest";
import type { KeyedImportCandidate } from "./deriveImportCandidates";
import { matchKeyedImportCandidate } from "./matchKeyedImportCandidate";

const keyedEth = (
  address: string,
  path = "m/44'/60'/0'/0/0"
): KeyedImportCandidate => ({
  chain: "ethereum",
  address: address.toLowerCase(),
  derivationPath: path,
  scheme: "standard",
  accountIndex: 0,
  privateKey: "0xabc",
});

describe("matchKeyedImportCandidate", () => {
  it("matches ethereum addresses case-insensitively", () => {
    const keyed = [keyedEth("0x6541493a00fa13418e9ed7c2f52b93bd32b91942")];

    const match = matchKeyedImportCandidate(
      {
        chain: "ethereum",
        address: "0x6541493A00fA13418E9ED7C2f52B93bD32b91942",
        derivationPath: "m/44'/60'/0'/0/0",
      },
      keyed
    );

    expect(match?.privateKey).toBe("0xabc");
  });

  it("requires matching derivation path", () => {
    const keyed = [keyedEth("0xabc", "m/44'/60'/1'/0'")];

    const match = matchKeyedImportCandidate(
      {
        chain: "ethereum",
        address: "0xabc",
        derivationPath: "m/44'/60'/0'/0/0",
      },
      keyed
    );

    expect(match).toBeUndefined();
  });
});
