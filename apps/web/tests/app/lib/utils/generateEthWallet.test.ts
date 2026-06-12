import { describe, expect, it } from "vitest";
import {
  generateEthWallet,
  standardEthDerivationPath,
} from "@/app/lib/utils/generateEthWallet";

const ABANDON_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

describe("generateEthWallet", () => {
  it("uses standard BIP44 path m/44'/60'/n'/0/0", () => {
    expect(standardEthDerivationPath(0)).toBe("m/44'/60'/0'/0/0");
    expect(standardEthDerivationPath(2)).toBe("m/44'/60'/2'/0/0");
  });

  it("derives abandon mnemonic account 0 address", async () => {
    const { ethPublicKey, derivationPath } = await generateEthWallet({
      mnemonic: ABANDON_MNEMONIC,
      accountIndex: 0,
    });

    expect(derivationPath).toBe("m/44'/60'/0'/0/0");
    expect(ethPublicKey.toLowerCase()).toBe(
      "0x9858effd232b4033e47d90003d41ec34ecaeda94"
    );
  });
});
