"use client";

import React, { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { useRecoilValue, useSetRecoilState, useRecoilState } from "recoil";
import { walletState } from "@my-org/store";
import { walletFlowState } from "@repo/store/src/atoms/walletFlowState";
import { importWalletState } from "@repo/store/src/atoms/importWalletState";
import { useTheme } from "../../../lib/contexts/ThemeContext";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import AppHeader from "../header/AppHeader";
import { WalletActions } from "../actions/WalletActions";
import { generateMnemonic } from "bip39";

import SolanaWallet from "./SolanaWallet";
import EthereumWallet from "./EthereumWallet";
import SeedPhraseContainer from "./SeedPhraseContainer";
import { WalletLoadingSkeleton } from "../loading";
import ImportWallet from "./sections/import/ImportWallet";
import { useWalletVault } from "@/app/lib/contexts/WalletVaultContext";
import { VaultPasswordSetup } from "./sections/vault/VaultPasswordSetup";
import { VaultUnlockScreen } from "./sections/vault/VaultUnlockScreen";
import { Dialog } from "../dialog/dialog";
import {
  clearImportSession,
  hasImportSessionKey,
  restoreImportSession,
} from "@/app/lib/utils/import/importSessionStorage";

type PendingFlow = "generate" | "import";

export const CryptoWalletContent = () => {
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const walletStateValue = useRecoilValue(walletState);
  const [currentFlow, setCurrentFlow] = useRecoilState(walletFlowState);
  const [importState, setImportState] = useRecoilState(importWalletState);
  const { activeTab = "solana" } = walletStateValue;
  const setWallet = useSetRecoilState(walletState);

  const vault = useWalletVault();
  const [passwordGateOpen, setPasswordGateOpen] = useState(false);
  const [pendingFlow, setPendingFlow] = useState<PendingFlow | null>(null);
  const [isPasswordGateLoading, setIsPasswordGateLoading] = useState(false);
  const [pendingImportRestore, setPendingImportRestore] = useState(false);

  const setActiveTab = (tab: "solana" | "ethereum") => {
    setWallet((prev) => ({
      ...prev,
      activeTab: tab,
    }));
  };

  useEffect(() => setIsHydrated(true), []);

  useEffect(() => {
    if (!vault.isHydrated) {
      return;
    }

    if (!hasImportSessionKey()) {
      return;
    }

    if (vault.hasVault && !vault.isUnlocked) {
      return;
    }

    if (vault.isUnlocked) {
      return;
    }

    setPendingImportRestore(true);
    setPendingFlow("import");
    setPasswordGateOpen(true);
  }, [vault.isHydrated, vault.hasVault, vault.isUnlocked]);

  const restorePendingImport = useCallback(() => {
    const session = restoreImportSession();
    if (!session) {
      return false;
    }

    setImportState((prev) => ({
      ...prev,
      isImporting: false,
      currentPhase: session.currentPhase,
      discoveredWallets: session.discoveredWallets,
      validationErrors: [],
      inputData: {
        ...prev.inputData,
        seedPhrase: session.inputData.seedPhrase,
        seedPhraseLength: session.inputData.seedPhraseLength,
      },
    }));
    vault.setMnemonic(session.inputData.seedPhrase);
    setCurrentFlow("import");
    return true;
  }, [setCurrentFlow, setImportState, vault.setMnemonic]);

  useLayoutEffect(() => {
    if (!vault.isHydrated || !vault.isUnlocked) {
      return;
    }

    restorePendingImport();
  }, [restorePendingImport, vault.isHydrated, vault.isUnlocked]);

  const handleVaultUnlock = useCallback(
    async (password: string) => {
      const ok = await vault.unlock(password);
      if (ok) {
        restorePendingImport();
      }
      return ok;
    },
    [restorePendingImport, vault.unlock]
  );

  useEffect(() => {
    if (!vault.isHydrated) {
      return;
    }

    if (vault.hasVault && !vault.isUnlocked) {
      return;
    }

    if (currentFlow !== "entry" && !vault.isUnlocked) {
      setCurrentFlow("entry");
    }
  }, [currentFlow, setCurrentFlow, vault.hasVault, vault.isHydrated, vault.isUnlocked]);

  const startGenerateWithPassword = async (password: string) => {
    vault.beginSetup(password);
    const newMnemonic = generateMnemonic();
    await vault.persistMnemonic(newMnemonic);
    setCurrentFlow("generate");
    toast.success("New wallet generated");
  };

  const startImportWithPassword = (password: string) => {
    vault.beginSetup(password);
    setCurrentFlow("import");
  };

  const needsPasswordGate = (flow: PendingFlow): boolean => {
    if (flow === "import" && vault.hasVault && vault.isUnlocked) {
      return false;
    }

    return !vault.isUnlocked;
  };

  const openFlow = (flow: PendingFlow) => {
    if (needsPasswordGate(flow)) {
      setPendingFlow(flow);
      setPasswordGateOpen(true);
      return;
    }

    setCurrentFlow(flow);
  };

  const generateWallet = () => openFlow("generate");
  const importWallet = () => {
    if (vault.isUnlocked && restorePendingImport()) {
      return;
    }
    openFlow("import");
  };

  const handlePasswordGateSubmit = async (password: string) => {
    setIsPasswordGateLoading(true);
    try {
      if (pendingFlow === "generate") {
        await startGenerateWithPassword(password);
      } else if (pendingFlow === "import") {
        if (pendingImportRestore) {
          vault.beginSetup(password);
          restorePendingImport();
          setPendingImportRestore(false);
        } else {
          startImportWithPassword(password);
        }
      } else {
        return;
      }

      setPasswordGateOpen(false);
      setPendingFlow(null);
    } catch (error) {
      vault.lock();
      toast.error(
        error instanceof Error ? error.message : "Failed to secure wallet"
      );
    } finally {
      setIsPasswordGateLoading(false);
    }
  };

  const handlePasswordGateOpenChange = (open: boolean) => {
    setPasswordGateOpen(open);
    if (!open) {
      setPendingFlow(null);
      setPendingImportRestore(false);
    }
  };

  const handleBackToEntry = () => {
    if (importState.isImporting) {
      return;
    }

    clearImportSession();
    vault.setMnemonic("");
    setImportState((prev) => ({
      ...prev,
      isImporting: false,
      currentPhase: "input",
      discoveredWallets: undefined,
      selectedImportWallets: [],
      validationErrors: [],
      inputData: {
        ...prev.inputData,
        seedPhrase: "",
      },
    }));

    if (!vault.hasVault) {
      vault.lock();
    }
    setCurrentFlow("entry");
  };

  const pendingImportConfirmation =
    importState.currentPhase === "confirmation" &&
    Boolean(importState.discoveredWallets);

  const showImportFlow =
    importState.currentPhase !== "complete" &&
    (currentFlow === "import" ||
      pendingImportConfirmation ||
      (vault.isUnlocked && hasImportSessionKey()));

  const showMainWallet =
    vault.isUnlocked && (Boolean(vault.mnemonic) || vault.hasWallets);

  const passwordGateDescription =
    pendingFlow === "import"
      ? pendingImportRestore
        ? "Set a password to continue your import. Your seed phrase and keys will be encrypted on this device."
        : "Set a password before importing. Your seed phrase and keys will be encrypted on this device."
      : "Set a password before generating a wallet. Your seed phrase and keys will be encrypted on this device.";

  if (!isHydrated || !vault.isHydrated) {
    return (
      <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-4xl mx-auto py-6 sm:py-8">
          <AppHeader toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
          <WalletLoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto py-6 sm:py-8">
        <AppHeader toggleTheme={toggleTheme} isDarkMode={isDarkMode} />

        {vault.hasVault && !vault.isUnlocked ? (
          <VaultUnlockScreen onUnlock={handleVaultUnlock} />
        ) : showImportFlow ? (
          <ImportWallet
            onBack={handleBackToEntry}
            isBackDisabled={importState.isImporting}
          />
        ) : currentFlow === "generate" ? (
          <>
            <SeedPhraseContainer
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <AnimatePresence mode="wait">
              {activeTab === "solana" && <SolanaWallet />}
              {activeTab === "ethereum" && <EthereumWallet />}
            </AnimatePresence>
          </>
        ) : showMainWallet ? (
          <>
            <SeedPhraseContainer
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onImportMore={importWallet}
            />
            <AnimatePresence mode="wait">
              {activeTab === "solana" && <SolanaWallet />}
              {activeTab === "ethereum" && <EthereumWallet />}
            </AnimatePresence>
          </>
        ) : pendingImportRestore || (hasImportSessionKey() && !vault.isUnlocked) ? (
          <div className="flex w-full max-w-md mx-auto flex-col items-center gap-4 py-12 text-center text-sm text-muted-foreground">
            Restoring wallet import…
          </div>
        ) : (
          <WalletActions
            generateWallet={generateWallet}
            importWallet={importWallet}
          />
        )}

        <Dialog open={passwordGateOpen} onOpenChange={handlePasswordGateOpenChange}>
          {pendingImportRestore ? (
            <VaultUnlockScreen
              variant="modal"
              title="Continue import"
              description="Enter your password to continue importing wallets."
              onUnlock={handlePasswordGateSubmit}
              isLoading={isPasswordGateLoading}
            />
          ) : (
            <VaultPasswordSetup
              variant="modal"
              description={passwordGateDescription}
              onSubmit={handlePasswordGateSubmit}
              isLoading={isPasswordGateLoading}
            />
          )}
        </Dialog>
      </div>
    </div>
  );
};
