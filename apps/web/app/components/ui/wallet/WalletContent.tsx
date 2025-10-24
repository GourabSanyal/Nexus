"use client";

import React, { useState, useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { walletState } from "@my-org/store";
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

export const CryptoWalletContent = () => {
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const walletStateValue = useRecoilValue(walletState);
  const setWallet = useSetRecoilState(walletState);
  const { mnemonicState: mnemonic, activeTab = "solana" } = walletStateValue;

  const setMnemonic = (newMnemonic: string) => {
    setWallet((prev) => ({
      ...prev,
      mnemonicState: newMnemonic,
    }));
  };

  const setActiveTab = (tab: "solana" | "ethereum") => {
    setWallet((prev) => ({
      ...prev,
      activeTab: tab,
    }));
  };

  useEffect(() => setIsHydrated(true), []);

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const generateWallet = async () => {
    const newMnemonic = generateMnemonic();
    setMnemonic(newMnemonic);
    toast.success("New wallet generated");
  };

  const importWallet = () => {
    toast.info("Import wallet functionality coming soon!");
  };

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto py-6 sm:py-8">
        <AppHeader toggleTheme={toggleTheme} isDarkMode={isDarkMode} />

        {!isHydrated ? (
          <WalletLoadingSkeleton />
        ) : (
          <>
            {!mnemonic ? (
              <WalletActions
                generateWallet={generateWallet}
                importWallet={importWallet}
              />
            ) : (
              <>
                <SeedPhraseContainer
                  mnemonic={mnemonic}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
                <AnimatePresence mode="wait">
                  {activeTab === "solana" && <SolanaWallet />}
                  {activeTab === "ethereum" && <EthereumWallet />}
                </AnimatePresence>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
