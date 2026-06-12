import { describe, expect, it } from "vitest";
import { deriveImportCandidates } from "@/app/lib/utils/import/deriveImportCandidates";

const ABANDON_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

const ATHLETE_MNEMONIC =
  "athlete reason combine sponsor verb clay ghost melt art invest often saddle";

describe("deriveImportCandidates", () => {
  it("derives standard abandon mnemonic addresses", async () => {
    const { candidates } = await deriveImportCandidates(ABANDON_MNEMONIC, 1);

    const sol = candidates.find(
      (c) =>
        c.chain === "solana" &&
        c.scheme === "standard" &&
        c.derivationPath === "m/44'/501'/0'/0'"
    );
    expect(sol?.address).toBe("HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk");

    const eth = candidates.find(
      (c) =>
        c.chain === "ethereum" &&
        c.scheme === "standard" &&
        c.derivationPath === "m/44'/60'/0'/0/0"
    );
    expect(eth?.address.toLowerCase()).toBe(
      "0x9858effd232b4033e47d90003d41ec34ecaeda94"
    );
  });

  it("derives athlete mnemonic legacy, standard, and nexus paths", async () => {
    const { candidates } = await deriveImportCandidates(ATHLETE_MNEMONIC, 3);

    const legacySol = candidates.find(
      (c) => c.scheme === "nexusLegacy" && c.chain === "solana"
    );
    expect(legacySol?.address).toBe("cBXvXnd8cUdyuNaUjdeakEWZ42Wbh5bhwpeMC5FSdRP");

    expect(
      candidates.find(
        (c) =>
          c.chain === "solana" &&
          c.derivationPath === "m/44'/501'/1'/0'" &&
          c.address === "GoXSRkGKExFuWgtfXdpyyfRsvsuFQurrzgqgXbxNpxup"
      )
    ).toBeDefined();

    expect(
      candidates.find(
        (c) =>
          c.chain === "ethereum" &&
          c.scheme === "nexusLegacy" &&
          c.address === "0x6541493a00fa13418e9ed7c2f52b93bd32b91942"
      )
    ).toBeDefined();

    const nexusEth = candidates.filter(
      (c) => c.scheme === "nexus" && c.chain === "ethereum"
    );
    expect(nexusEth).toHaveLength(3);

    const standardEth = candidates.filter(
      (c) => c.scheme === "standard" && c.chain === "ethereum"
    );
    expect(standardEth).toHaveLength(3);
  });

  it("returns keyed material without exposing it in candidates payload", async () => {
    const { candidates, keyed } = await deriveImportCandidates(ABANDON_MNEMONIC, 1);

    expect(keyed.length).toBeGreaterThan(0);
    expect(keyed.every((entry) => entry.privateKey.length > 0)).toBe(true);
    expect(
      candidates.every((entry) => !("privateKey" in entry))
    ).toBe(true);
  });

  it("rejects invalid mnemonics", async () => {
    await expect(
      deriveImportCandidates("abandon abandon abandon abandon")
    ).rejects.toThrow(/invalid seed phrase/i);
  });
});
