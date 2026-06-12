"use client";

import React from "react";
import { RecoilRoot } from "recoil";
import { ThemeProvider } from "./lib/contexts/ThemeContext";
import { Toaster } from "sonner";
import { CryptoWalletContent } from "./components/ui/wallet/WalletContent";
import { WalletVaultProvider } from "./lib/contexts/WalletVaultContext";

const CryptoWallet = () => {
  return (
    <ThemeProvider>
      <RecoilRoot>
        <WalletVaultProvider>
          <Toaster />
          <CryptoWalletContent />
        </WalletVaultProvider>
      </RecoilRoot>
    </ThemeProvider>
  );
};

export default CryptoWallet;
