import { argon2id } from "hash-wasm";
import { z } from "zod";

export const WALLET_VAULT_VERSION = 1 as const;

export const WALLET_VAULT_KDF_PARAMS = {
  memoryKiB: 65536,
  iterations: 3,
  parallelism: 1,
} as const;

export const vaultWalletEntrySchema = z.object({
  id: z.number(),
  chain: z.enum(["solana", "ethereum"]),
  privateKey: z.string().min(1),
  path: z.string().optional(),
});

export const vaultPlaintextSchema = z.object({
  mnemonic: z.string().min(1),
  wallets: z.array(vaultWalletEntrySchema),
});

export const walletVaultKdfParamsSchema = z.object({
  memoryKiB: z.number().int().positive(),
  iterations: z.number().int().positive(),
  parallelism: z.number().int().positive(),
});

export const walletVaultEnvelopeSchema = z.object({
  v: z.literal(WALLET_VAULT_VERSION),
  kdf: z.literal("argon2id"),
  kdfParams: walletVaultKdfParamsSchema,
  salt: z.string().min(1),
  iv: z.string().min(1),
  ciphertext: z.string().min(1),
});

export type VaultWalletEntry = z.infer<typeof vaultWalletEntrySchema>;
export type VaultPlaintext = z.infer<typeof vaultPlaintextSchema>;
export type WalletVaultKdfParams = z.infer<typeof walletVaultKdfParamsSchema>;
export type WalletVaultEnvelope = z.infer<typeof walletVaultEnvelopeSchema>;

export type WalletVaultErrorCode =
  | "INVALID_ENVELOPE"
  | "WRONG_PASSWORD"
  | "UNSUPPORTED_VERSION";

export class WalletVaultError extends Error {
  readonly code: WalletVaultErrorCode;

  constructor(message: string, code: WalletVaultErrorCode) {
    super(message);
    this.name = "WalletVaultError";
    this.code = code;
  }
}

const AES_KEY_LENGTH = 32;
const GCM_IV_LENGTH = 12;
const KDF_SALT_LENGTH = 16;

const randomBytes = (length: number): Uint8Array => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
};

const base64ToBytes = (base64: string): Uint8Array => {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"));
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
};

const deriveVaultKey = async (
  password: string,
  salt: Uint8Array,
  kdfParams: WalletVaultKdfParams
): Promise<Uint8Array> => {
  const key = await argon2id({
    password,
    salt,
    parallelism: kdfParams.parallelism,
    iterations: kdfParams.iterations,
    memorySize: kdfParams.memoryKiB,
    hashLength: AES_KEY_LENGTH,
    outputType: "binary",
  });

  return key as Uint8Array;
};

const importAesKey = async (rawKey: Uint8Array): Promise<CryptoKey> =>
  crypto.subtle.importKey(
    "raw",
    toArrayBuffer(rawKey),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );

const encryptPlaintext = async (
  plaintext: VaultPlaintext,
  password: string,
  salt: Uint8Array,
  kdfParams: WalletVaultKdfParams
): Promise<{ iv: Uint8Array; ciphertext: Uint8Array }> => {
  const rawKey = await deriveVaultKey(password, salt, kdfParams);
  const cryptoKey = await importAesKey(rawKey);
  const iv = randomBytes(GCM_IV_LENGTH);
  const encoded = new TextEncoder().encode(JSON.stringify(plaintext));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    cryptoKey,
    encoded
  );

  return { iv, ciphertext: new Uint8Array(ciphertext) };
};

const parseDecryptedPlaintext = (decoded: string): VaultPlaintext => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(decoded);
  } catch {
    throw new WalletVaultError("Vault payload is not valid JSON", "WRONG_PASSWORD");
  }

  const result = vaultPlaintextSchema.safeParse(parsed);
  if (!result.success) {
    throw new WalletVaultError("Vault payload failed validation", "WRONG_PASSWORD");
  }

  return result.data;
};

const isDecryptFailure = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "OperationError";

export const parseWalletVaultEnvelope = (
  value: unknown
): WalletVaultEnvelope => {
  const result = walletVaultEnvelopeSchema.safeParse(value);
  if (!result.success) {
    throw new WalletVaultError("Invalid vault envelope", "INVALID_ENVELOPE");
  }

  return result.data;
};

export const encryptVault = async (
  plaintext: VaultPlaintext,
  password: string
): Promise<WalletVaultEnvelope> => {
  const validated = vaultPlaintextSchema.parse(plaintext);
  const salt = randomBytes(KDF_SALT_LENGTH);
  const { iv, ciphertext } = await encryptPlaintext(
    validated,
    password,
    salt,
    WALLET_VAULT_KDF_PARAMS
  );

  return {
    v: WALLET_VAULT_VERSION,
    kdf: "argon2id",
    kdfParams: { ...WALLET_VAULT_KDF_PARAMS },
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(ciphertext),
  };
};

export const decryptVault = async (
  envelope: WalletVaultEnvelope,
  password: string
): Promise<VaultPlaintext> => {
  const validated = parseWalletVaultEnvelope(envelope);
  const salt = base64ToBytes(validated.salt);
  const iv = base64ToBytes(validated.iv);
  const ciphertext = base64ToBytes(validated.ciphertext);

  let rawKey: Uint8Array;
  try {
    rawKey = await deriveVaultKey(password, salt, validated.kdfParams);
  } catch {
    throw new WalletVaultError("Failed to derive vault key", "WRONG_PASSWORD");
  }

  const cryptoKey = await importAesKey(rawKey);

  let decrypted: ArrayBuffer;
  try {
    decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: toArrayBuffer(iv) },
      cryptoKey,
      toArrayBuffer(ciphertext)
    );
  } catch (error) {
    if (isDecryptFailure(error)) {
      throw new WalletVaultError("Incorrect vault password", "WRONG_PASSWORD");
    }
    throw error;
  }

  const decoded = new TextDecoder().decode(decrypted);
  return parseDecryptedPlaintext(decoded);
};
