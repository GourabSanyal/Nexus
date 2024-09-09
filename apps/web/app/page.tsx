"use client"

import { ThemeProvider} from "./lib/utils/ThemeContext";
import { Toaster } from 'sonner'
import { CryptoWalletContent } from "./components/ui/wallet/WalletContent";

const CryptoWallet = () => {
  return (
    <ThemeProvider>
      <Toaster />
      <CryptoWalletContent />
    </ThemeProvider>
  );
};

export default CryptoWallet;