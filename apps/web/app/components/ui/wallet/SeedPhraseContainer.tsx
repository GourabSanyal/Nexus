"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Copy } from "lucide-react";
import { Button } from "../button/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../card/card";
import {
  TooltipProvider,
} from "../tooltip";
import { copyToClipboard } from "@/app/lib/utils/clipboard";
import { SeedPhraseContainerPropTypes } from "@/app/types/components";


const SeedPhraseContainer = ({
  mnemonic,
  activeTab,
  setActiveTab,
}: SeedPhraseContainerPropTypes) => {
  const [showSeedPhrase, setShowSeedPhrase] = useState<boolean>(false);

  return (
    <TooltipProvider>
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
                      <div className="flex space-x-2">
                        {showSeedPhrase && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              copyToClipboard(mnemonic, "seed phrase")
                            }
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Copy size={16} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {showSeedPhrase ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm">
                      {showSeedPhrase ? mnemonic : "••••• ••••• ••••• •••••"}
                    </div>
                  </div>
                )}
              </div>
              <Tabs
                value={activeTab}
                onValueChange={(value: string) => {
                  setActiveTab(value as "solana" | "ethereum");
                }}
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
    </TooltipProvider>
  );
};

export default SeedPhraseContainer;
