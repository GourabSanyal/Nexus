import { describe, expect, it } from "vitest";
import {
  WalletVaultError,
  decryptVault,
  encryptVault,
  parseWalletVaultEnvelope,
  walletVaultEnvelopeSchema,
  type VaultPlaintext,
} from "@/app/lib/crypto/walletVault";

const samplePlaintext = (): VaultPlaintext => ({
  mnemonic:
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
  wallets: [
    {
      id: 1,
      chain: "solana",
      privateKey: "c2VjcmV0LXNvbA==",
      path: "m/44'/501'/0'/0'",
    },
    {
      id: 2,
      chain: "ethereum",
      privateKey: "0xdeadbeef",
      path: "m/44'/60'/0'/0/0",
    },
  ],
});

describe("walletVault", () => {
  it("round-trips mnemonic-only vault before any chain wallet exists", async () => {
    const plaintext: VaultPlaintext = {
      mnemonic:
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
      wallets: [],
    };
    const envelope = await encryptVault(plaintext, "vault-password-123");
    const decrypted = await decryptVault(envelope, "vault-password-123");
    expect(decrypted).toEqual(plaintext);
  });

  it("round-trips encrypt and decrypt", async () => {
    const plaintext = samplePlaintext();
    const envelope = await encryptVault(plaintext, "vault-password-123");

    expect(walletVaultEnvelopeSchema.safeParse(envelope).success).toBe(true);
    expect(envelope.kdf).toBe("argon2id");
    expect(envelope.kdfParams).toEqual({
      memoryKiB: 65536,
      iterations: 3,
      parallelism: 1,
    });

    const decrypted = await decryptVault(envelope, "vault-password-123");
    expect(decrypted).toEqual(plaintext);
  });

  it("rejects wrong password", async () => {
    const envelope = await encryptVault(samplePlaintext(), "correct-password");

    await expect(decryptVault(envelope, "wrong-password")).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof WalletVaultError && error.code === "WRONG_PASSWORD"
    );
  });

  it("parses a valid envelope and rejects invalid shapes", () => {
    const envelope = {
      v: 1,
      kdf: "argon2id",
      kdfParams: { memoryKiB: 65536, iterations: 3, parallelism: 1 },
      salt: "c2FsdA==",
      iv: "aXY=",
      ciphertext: "Y2lwaGVydGV4dA==",
    };

    expect(parseWalletVaultEnvelope(envelope)).toEqual(envelope);
    expect(() => parseWalletVaultEnvelope({ v: 2 })).toThrow(WalletVaultError);
  });
});
