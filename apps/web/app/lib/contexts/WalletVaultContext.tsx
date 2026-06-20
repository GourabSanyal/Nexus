"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { toast } from "sonner";
import {
  walletState,
  walletVaultEnvelopeState,
  transactionHistoryState,
  walletBalancesState,
  walletNetworkOverrideState,
  clearWalletPersistenceFromStorage,
} from "@my-org/store";
import type {
  PublicEthereumWallet,
  PublicSolanaWallet,
  WalletPublicSchema,
} from "@my-org/zod";
import {
  decryptVault,
  encryptVault,
  parseWalletVaultEnvelope,
  WalletVaultError,
  type VaultPlaintext,
  type VaultWalletEntry,
} from "@/app/lib/crypto/walletVault";
import {
  clearLegacyWalletState,
  legacyToPublicState,
  legacyToVaultPlaintext,
  readLegacyWalletState,
} from "@/app/lib/crypto/legacyWalletMigration";
import { clearImportSession } from "@/app/lib/utils/import/importSessionStorage";

const IDLE_LOCK_MS = 12 * 60 * 1000;

type WalletVaultContextValue = {
  isHydrated: boolean;
  isUnlocked: boolean;
  hasVault: boolean;
  hasWallets: boolean;
  mnemonic: string | null;
  beginSetup: (password: string) => void;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  verifyPassword: (password: string) => Promise<boolean>;
  persistMnemonic: (mnemonic: string) => Promise<void>;
  setMnemonic: (mnemonic: string) => void;
  getPrivateKey: (walletId: number, chain: "solana" | "ethereum") => string | null;
  addWallet: (
    type: "solana" | "ethereum",
    publicKey: string,
    privateKey: string,
    path?: string
  ) => Promise<void>;
  deleteWallet: (id: number, type: "solana" | "ethereum") => Promise<void>;
  importWallets: (input: {
    mnemonic: string;
    publicState: WalletPublicSchema;
    vaultEntries: VaultWalletEntry[];
  }) => Promise<void>;
  clearWallet: () => void;
};

const WalletVaultContext = createContext<WalletVaultContextValue | null>(null);

const emptyPublicState = (): WalletPublicSchema => ({
  solanaWallets: [],
  ethereumWallets: [],
  activeTab: "solana",
});

export const WalletVaultProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [publicWallet, setPublicWallet] = useRecoilState(walletState);
  const [vaultState, setVaultState] = useRecoilState(walletVaultEnvelopeState);
  const setVaultEnvelopeOnly = useSetRecoilState(walletVaultEnvelopeState);
  const setTransactionHistory = useSetRecoilState(transactionHistoryState);
  const setWalletBalances = useSetRecoilState(walletBalancesState);
  const setWalletNetworkOverrides = useSetRecoilState(walletNetworkOverrideState);

  const [plaintext, setPlaintext] = useState<VaultPlaintext | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [legacyPending, setLegacyPending] = useState(false);
  const sessionPasswordRef = useRef<string | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasVault = Boolean(vaultState.envelope) || legacyPending;
  const hasWallets =
    (publicWallet.solanaWallets?.length ?? 0) > 0 ||
    (publicWallet.ethereumWallets?.length ?? 0) > 0;
  const isUnlocked = plaintext !== null;

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    if (!sessionPasswordRef.current) {
      return;
    }

    idleTimerRef.current = setTimeout(() => {
      setPlaintext(null);
      sessionPasswordRef.current = null;
      toast.message("Wallet locked due to inactivity");
    }, IDLE_LOCK_MS);
  }, []);

  const lock = useCallback(() => {
    setPlaintext(null);
    sessionPasswordRef.current = null;
    clearImportSession();
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const persistEncrypted = useCallback(
    async (nextPlaintext: VaultPlaintext, password: string) => {
      const envelope = await encryptVault(nextPlaintext, password);
      setVaultState({ envelope });
      setPlaintext(nextPlaintext);
      sessionPasswordRef.current = password;
      resetIdleTimer();
    },
    [resetIdleTimer, setVaultState]
  );

  useEffect(() => {
    const legacy = readLegacyWalletState();
    setLegacyPending(Boolean(legacy));
    if (!legacy) {
      setIsHydrated(true);
      return;
    }

    const migratedPublic = legacyToPublicState(legacy);
    setPublicWallet((prev) => ({
      ...prev,
      ...migratedPublic,
    }));
    setIsHydrated(true);
  }, [setPublicWallet]);

  useEffect(() => {
    const onActivity = () => {
      if (sessionPasswordRef.current) {
        resetIdleTimer();
      }
    };

    window.addEventListener("pointerdown", onActivity);
    window.addEventListener("keydown", onActivity);

    return () => {
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [resetIdleTimer]);

  const beginSetup = useCallback((password: string) => {
    sessionPasswordRef.current = password;
    setPlaintext({ mnemonic: "", wallets: [] });
    resetIdleTimer();
  }, [resetIdleTimer]);

  const unlock = useCallback(
    async (password: string): Promise<boolean> => {
      const legacy = readLegacyWalletState();
      if (legacy) {
        const legacyPlaintext = legacyToVaultPlaintext(legacy);
        if (!legacyPlaintext) {
          toast.error("Legacy wallet data could not be migrated");
          return false;
        }

        try {
          await persistEncrypted(legacyPlaintext, password);
          setPublicWallet(legacyToPublicState(legacy));
          clearLegacyWalletState();
          setLegacyPending(false);
          toast.success("Wallet secured with your password");
          return true;
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Failed to secure wallet"
          );
          return false;
        }
      }

      if (!vaultState.envelope) {
        toast.error("No encrypted wallet found");
        return false;
      }

      try {
        const envelope = parseWalletVaultEnvelope(vaultState.envelope);
        const decrypted = await decryptVault(envelope, password);
        setPlaintext(decrypted);
        sessionPasswordRef.current = password;
        resetIdleTimer();
        return true;
      } catch (error) {
        if (error instanceof WalletVaultError && error.code === "WRONG_PASSWORD") {
          toast.error("Incorrect password");
        } else {
          toast.error("Failed to unlock wallet");
        }
        return false;
      }
    },
    [persistEncrypted, resetIdleTimer, setPublicWallet, vaultState.envelope]
  );

  const verifyPassword = useCallback(
    async (password: string): Promise<boolean> => {
      if (!vaultState.envelope) {
        return sessionPasswordRef.current === password;
      }

      try {
        const envelope = parseWalletVaultEnvelope(vaultState.envelope);
        await decryptVault(envelope, password);
        return true;
      } catch {
        return false;
      }
    },
    [vaultState.envelope]
  );

  const setMnemonic = useCallback((mnemonic: string) => {
    setPlaintext((prev) => ({
      mnemonic,
      wallets: prev?.wallets ?? [],
    }));
    resetIdleTimer();
  }, [resetIdleTimer]);

  const persistMnemonic = useCallback(
    async (mnemonic: string) => {
      const password = sessionPasswordRef.current;
      if (!password) {
        throw new Error("Vault password is required");
      }

      const trimmed = mnemonic.trim();
      if (!trimmed) {
        throw new Error("Mnemonic is required");
      }

      const nextPlaintext: VaultPlaintext = {
        mnemonic: trimmed,
        wallets: plaintext?.wallets ?? [],
      };

      await persistEncrypted(nextPlaintext, password);
    },
    [persistEncrypted, plaintext?.wallets]
  );

  const getPrivateKey = useCallback(
    (walletId: number, chain: "solana" | "ethereum"): string | null => {
      if (!plaintext) {
        return null;
      }

      return (
        plaintext.wallets.find(
          (entry) => entry.id === walletId && entry.chain === chain
        )?.privateKey ?? null
      );
    },
    [plaintext]
  );

  const addWallet = useCallback(
    async (
      type: "solana" | "ethereum",
      publicKey: string,
      privateKey: string,
      path?: string
    ) => {
      const password = sessionPasswordRef.current;
      if (!password || !plaintext) {
        throw new Error("Wallet is locked");
      }

      const id = Date.now();
      const vaultEntry: VaultWalletEntry = {
        id,
        chain: type,
        privateKey,
        path,
      };

      const nextPlaintext: VaultPlaintext = {
        mnemonic: plaintext.mnemonic,
        wallets: [...plaintext.wallets, vaultEntry],
      };

      if (type === "solana") {
        const newWallet: PublicSolanaWallet = {
          id,
          name: `Solana Wallet ${(publicWallet.solanaWallets?.length ?? 0) + 1}`,
          publicKey,
          type: "solana",
          path,
        };
        setPublicWallet((prev) => ({
          ...prev,
          solanaWallets: [...(prev.solanaWallets ?? []), newWallet],
        }));
      } else {
        const newWallet: PublicEthereumWallet = {
          id,
          name: `Ethereum Wallet ${(publicWallet.ethereumWallets?.length ?? 0) + 1}`,
          publicKey,
          type: "ethereum",
          path,
        };
        setPublicWallet((prev) => ({
          ...prev,
          ethereumWallets: [...(prev.ethereumWallets ?? []), newWallet],
        }));
      }

      await persistEncrypted(nextPlaintext, password);
      toast.success(`New ${type === "solana" ? "Solana" : "Ethereum"} wallet added`);
    },
    [persistEncrypted, plaintext, publicWallet, setPublicWallet]
  );

  const deleteWallet = useCallback(
    async (id: number, type: "solana" | "ethereum") => {
      const password = sessionPasswordRef.current;
      if (!password || !plaintext) {
        throw new Error("Wallet is locked");
      }

      const nextPlaintext: VaultPlaintext = {
        mnemonic: plaintext.mnemonic,
        wallets: plaintext.wallets.filter(
          (entry) => !(entry.id === id && entry.chain === type)
        ),
      };

      if (type === "solana") {
        setPublicWallet((prev) => ({
          ...prev,
          solanaWallets: prev.solanaWallets?.filter((wallet) => wallet.id !== id) ?? [],
        }));
      } else {
        setPublicWallet((prev) => ({
          ...prev,
          ethereumWallets:
            prev.ethereumWallets?.filter((wallet) => wallet.id !== id) ?? [],
        }));
      }

      await persistEncrypted(nextPlaintext, password);
      toast.success(`${type === "solana" ? "Solana" : "Ethereum"} wallet deleted`);
    },
    [persistEncrypted, plaintext, setPublicWallet]
  );

  const importWallets = useCallback(
    async (input: {
      mnemonic: string;
      publicState: WalletPublicSchema;
      vaultEntries: VaultWalletEntry[];
    }) => {
      const password = sessionPasswordRef.current;
      if (!password) {
        throw new Error("Vault password is required");
      }

      const base = plaintext ?? { mnemonic: "", wallets: [] };
      const nextPlaintext: VaultPlaintext = {
        mnemonic: input.mnemonic || base.mnemonic,
        wallets: [...base.wallets, ...input.vaultEntries],
      };

      setPublicWallet(input.publicState);
      await persistEncrypted(nextPlaintext, password);
      clearLegacyWalletState();
    },
    [persistEncrypted, plaintext, setPublicWallet]
  );

  const clearWallet = useCallback(() => {
    lock();
    setPublicWallet(emptyPublicState());
    setVaultEnvelopeOnly({ envelope: null });
    setTransactionHistory({});
    setWalletBalances({});
    setWalletNetworkOverrides({});
    clearLegacyWalletState();

    queueMicrotask(() => {
      clearWalletPersistenceFromStorage();
    });
  }, [
    lock,
    setPublicWallet,
    setTransactionHistory,
    setVaultEnvelopeOnly,
    setWalletBalances,
    setWalletNetworkOverrides,
  ]);

  const value = useMemo(
    () => ({
      isHydrated,
      isUnlocked,
      hasVault,
      hasWallets,
      mnemonic: plaintext?.mnemonic?.trim() ? plaintext.mnemonic : null,
      beginSetup,
      unlock,
      lock,
      verifyPassword,
      persistMnemonic,
      setMnemonic,
      getPrivateKey,
      addWallet,
      deleteWallet,
      importWallets,
      clearWallet,
    }),
    [
      addWallet,
      beginSetup,
      clearWallet,
      deleteWallet,
      getPrivateKey,
      hasVault,
      hasWallets,
      importWallets,
      isHydrated,
      isUnlocked,
      lock,
      plaintext,
      persistMnemonic,
      setMnemonic,
      unlock,
      verifyPassword,
    ]
  );

  return (
    <WalletVaultContext.Provider value={value}>
      {children}
    </WalletVaultContext.Provider>
  );
};

export const useWalletVault = (): WalletVaultContextValue => {
  const context = useContext(WalletVaultContext);
  if (!context) {
    throw new Error("useWalletVault must be used within WalletVaultProvider");
  }
  return context;
};
