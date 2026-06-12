"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Copy, LogOut, Download } from "lucide-react";
import { Button } from "../button/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../card/card";
import { TooltipProvider } from "../tooltip";
import { copyToClipboard } from "@/app/lib/utils/clipboard";
import { SeedPhraseContainerPropTypes } from "@/app/types/components";
import { Dialog } from "../dialog/dialog";
import LogoutConfirmationModal from "@components/ui/wallet/sections/password/LogoutConfirmationModal";
import PasswordInput from "./sections/password/PasswordInput";
import { useWalletVault } from "@/app/lib/contexts/WalletVaultContext";
import { toast } from "sonner";

const SeedPhraseContainer = ({
  activeTab,
  setActiveTab,
  onImportMore,
}: SeedPhraseContainerPropTypes) => {
  const [showSeedPhrase, setShowSeedPhrase] = useState<boolean>(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
  const [seedDialogOpen, setSeedDialogOpen] = useState<boolean>(false);
  const vault = useWalletVault();

  const handleLogout = () => {
    vault.clearWallet();
    setIsLogoutModalOpen(false);
    setShowSeedPhrase(false);
  };

  const handleToggleSeedPhrase = useCallback(() => {
    if (showSeedPhrase) {
      setShowSeedPhrase(false);
      return;
    }
    setSeedDialogOpen(true);
  }, [showSeedPhrase]);

  const onSeedPasswordSubmit = async ({ password }: { password: string }) => {
    const valid = await vault.verifyPassword(password);
    if (!valid) {
      toast.error("Incorrect password");
      return;
    }

    setShowSeedPhrase(true);
    setSeedDialogOpen(false);
  };

  const mnemonic = vault.mnemonic ?? "";

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
              <CardTitle className="flex justify-between items-center gap-2">
                <span>Crypto Wallet Generator</span>
                <div className="flex items-center gap-1">
                  {onImportMore ? (
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground text-sm px-2"
                      onClick={onImportMore}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Import
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => setIsLogoutModalOpen(true)}
                  >
                    <LogOut size={20} />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
                <LogoutConfirmationModal
                  onConfirm={handleLogout}
                  onCancel={() => setIsLogoutModalOpen(false)}
                />
              </Dialog>
              <Dialog open={seedDialogOpen} onOpenChange={setSeedDialogOpen}>
                <PasswordInput onSubmit={onSeedPasswordSubmit} />
              </Dialog>
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
                          onClick={handleToggleSeedPhrase}
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
