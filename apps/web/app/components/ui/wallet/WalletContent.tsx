"use client";

import React, { useState, useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { walletState } from "@my-org/store"
import { useTheme } from "../../../lib/utils/ThemeContext";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import WalletHeader from "../header/WalletHeader";
import { WalletActions } from "../actions/WalletActions";
import { generateMnemonic } from "bip39";

import SolanaWallet from "./SolanaWallet";
import EthereumWallet from "./EthereumWallet";
import SeedPhraseContainer from "./SeedPhraseContainer";

export const CryptoWalletContent = () => {
  const [activeTab, setActiveTab] = useState<"solana" | "ethereum">("solana");
  const { isDarkMode, toggleTheme } = useTheme();
  const [mnemonic, setMnemonic] = useState<string>("");

  const walletStateFromRecoiil = useRecoilValue(walletState)

  console.log("mneumonic state", walletStateFromRecoiil);
  

  useEffect(() => { 
    document.body.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const storedMnemonic = localStorage.getItem("mnemonic");
    if (storedMnemonic) {
      setMnemonic(storedMnemonic); 
    }
  }, []);

  const generateWallet = async () => {
    const newMnemonic = generateMnemonic();
    setMnemonic(newMnemonic);
    localStorage.setItem("mnemonic", mnemonic);
    toast.success("New wallet generated");
  };

  return (
    <div className="container flex flex-col justify-start min-h-screen transition-colors duration-300">
      <div className="max-w-3xl w-full mx-auto">
        <WalletHeader toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        {!mnemonic ? <WalletActions generateWallet={generateWallet} /> : null}
        {mnemonic ? <SeedPhraseContainer mnemonic={mnemonic} /> : null}
        <AnimatePresence mode="wait">
          {activeTab === "solana" && <SolanaWallet mnemonic={mnemonic} />}
          {activeTab === "ethereum" && <EthereumWallet mnemonic={mnemonic} />}
        </AnimatePresence>
      </div>
    </div>
  );
};
