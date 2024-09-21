"use client"

import React, {useState} from 'react'
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../button/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../card/card";
import { toast } from 'sonner';

interface SeedPhraseContainerPropTypes {
    mnemonic: string;
}

const SeedPhraseContainer = ({ mnemonic } :SeedPhraseContainerPropTypes) => {
    const [showSeedPhrase, setShowSeedPhrase] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<"solana" | "ethereum">("solana");

    const copyToClipboard = (text: string, keyType: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`Copied ${keyType}`);
      };

  return (
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
  )
}

export default SeedPhraseContainer