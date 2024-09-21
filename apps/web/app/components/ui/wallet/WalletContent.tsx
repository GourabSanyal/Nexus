"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../button/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../card/card";
import { useTheme } from "../../../lib/utils/ThemeContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import WalletHeader from "../header/WalletHeader";
import { WalletActions } from "../actions/WalletActions";
import { generateMnemonic } from "bip39";

import SolanaWallet from "./SolanaWallet";
import EthereumWallet from "./EthereumWallet";
import SeedPhraseContainer from "./SeedPhraseContainer";

export const CryptoWalletContent = () => {
  const [showSeedPhrase, setShowSeedPhrase] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"solana" | "ethereum">("solana");
  const { isDarkMode, toggleTheme } = useTheme();
  const [mnemonic, setMnemonic] = useState<string>("");

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const storedMnemonic = localStorage.getItem("mnemonic")
    if (storedMnemonic) {
      setMnemonic(storedMnemonic); // Set the mnemonic from localStorage if it exists
    }
  }, [])

  const generateWallet = async () => {
    const newMnemonic = generateMnemonic();
    setMnemonic(newMnemonic);
    localStorage.setItem("mnemonic", mnemonic);
    toast.success("New wallet generated");
  };

  const copyToClipboard = (text: string, keyType: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${keyType}`);
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
