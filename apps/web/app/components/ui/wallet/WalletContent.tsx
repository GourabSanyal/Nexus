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
export const CryptoWalletContent = () => {
  const [showSeedPhrase, setShowSeedPhrase] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"solana" | "ethereum">("solana");
  const { isDarkMode, toggleTheme } = useTheme();
  const [mnemonic, setMnemonic] = useState<string>("");

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const generateWallet = async () => {
    const newMnemonic = generateMnemonic();
    setMnemonic(newMnemonic);
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
        {mnemonic ? (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-6 bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle>Crypto Wallet Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    {mnemonic && (
                      <div className="mb-4 p-4 bg-muted rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">Seed Phrase:</span>
                          <Button
                            variant="ghost"
                            // size="sm"
                            onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                          >
                            {showSeedPhrase ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </Button>
                        </div>
                        <div
                          className="text-sm cursor-pointer"
                          onClick={() =>
                            copyToClipboard(mnemonic, "seed phrase")
                          }
                        >
                          {showSeedPhrase
                            ? mnemonic
                            : "••••• ••••• ••••• •••••"}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* <SeedPhraseDisplay
              seedPhrase={seedPhrase}
              showSeedPhrase={showSeedPhrase}
              setShowSeedPhrase={setShowSeedPhrase}
              copyToClipboard={copyToClipboard}
            /> */}
                  <Tabs
                    value={activeTab}
                    onValueChange={(value: string) =>
                      setActiveTab(value as "solana" | "ethereum")
                    }
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="solana">Solana</TabsTrigger>
                      <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        ) : null}
        <AnimatePresence mode="wait">
          {activeTab === "solana" && <SolanaWallet mnemonic={mnemonic} />}
          {activeTab === "ethereum" && <EthereumWallet mnemonic={mnemonic} />}
        </AnimatePresence>
      </div>
    </div>
  );
};
