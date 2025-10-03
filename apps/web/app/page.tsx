"use client";

import React from "react";
import { RecoilRoot } from "recoil";
import { ThemeProvider } from "./lib/contexts/ThemeContext";
import { Toaster } from "sonner";
import { CryptoWalletContent } from "./components/ui/wallet/WalletContent";

const CryptoWallet = () => {
  return (
    <ThemeProvider>
      <RecoilRoot>
        <Toaster />
        <CryptoWalletContent />
      </RecoilRoot>
    </ThemeProvider>
  );
};

export default CryptoWallet;
