import type {
  PublicEthereumWallet,
  PublicSolanaWallet,
  WalletPublicSchema,
} from "@my-org/zod";
import type { VaultPlaintext } from "@/app/lib/crypto/walletVault";

const LEGACY_STORAGE_KEY = "recoil-persist-wallet-state";

type LegacyWallet = {
  id: number;
  name: string;
  publicKey: string;
  privateKey?: string;
  type: "solana" | "ethereum";
  mnemonic?: string;
  path?: string;
};

type LegacyWalletState = {
  mnemonicState?: string;
  solanaWallets?: LegacyWallet[];
  ethereumWallets?: LegacyWallet[];
  activeTab?: "solana" | "ethereum";
};

const hasSecretFields = (state: LegacyWalletState): boolean => {
  if (state.mnemonicState?.trim()) {
    return true;
  }

  const wallets = [
    ...(state.solanaWallets ?? []),
    ...(state.ethereumWallets ?? []),
  ];

  return wallets.some((wallet) => Boolean(wallet.privateKey));
};

export const readLegacyWalletState = (): LegacyWalletState | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as LegacyWalletState;
    return hasSecretFields(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const legacyToVaultPlaintext = (
  legacy: LegacyWalletState
): VaultPlaintext | null => {
  const mnemonic = legacy.mnemonicState?.trim() ?? "";
  const wallets = [
    ...(legacy.solanaWallets ?? []).map((wallet) => ({
      id: wallet.id,
      chain: "solana" as const,
      privateKey: wallet.privateKey ?? "",
      path: wallet.path,
    })),
    ...(legacy.ethereumWallets ?? []).map((wallet) => ({
      id: wallet.id,
      chain: "ethereum" as const,
      privateKey: wallet.privateKey ?? "",
      path: wallet.path,
    })),
  ].filter((entry) => entry.privateKey.length > 0);

  if (!mnemonic || wallets.length === 0) {
    return null;
  }

  return { mnemonic, wallets };
};

export const legacyToPublicState = (
  legacy: LegacyWalletState
): WalletPublicSchema => ({
  solanaWallets: (legacy.solanaWallets ?? []).map(
    ({ id, name, publicKey, path }): PublicSolanaWallet => ({
      id,
      name,
      publicKey,
      type: "solana",
      path,
    })
  ),
  ethereumWallets: (legacy.ethereumWallets ?? []).map(
    ({ id, name, publicKey, path }): PublicEthereumWallet => ({
      id,
      name,
      publicKey,
      type: "ethereum",
      path,
    })
  ),
  activeTab: legacy.activeTab ?? "solana",
});

export const clearLegacyWalletState = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(LEGACY_STORAGE_KEY);
};
