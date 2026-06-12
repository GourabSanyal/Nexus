"use client";
import { useState } from "react";
import { Button } from "../button/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { SingleWalletProps } from "@/app/types/wallet/SingleWalletProps";
import { WalletPath } from "@repo/constants/src/WalletPaths";
import { useWalletOperations } from "@my-org/store";
import { generateWallet } from "@/app/lib/utils/walletGeneration";
import { WalletRenderer } from "./WalletRenderer";
import { useWalletVault } from "@/app/lib/contexts/WalletVaultContext";

const SingleWallet = ({ path }: SingleWalletProps) => {
  const { walletState } = useWalletOperations();
  const { addWallet, mnemonic, isUnlocked } = useWalletVault();
  const [isGenerating, setIsGenerating] = useState(false);
  const solanaWallets = walletState.solanaWallets || [];
  const ethereumWallets = walletState.ethereumWallets || [];

  const generateWallets = async () => {
    if (!mnemonic) {
      toast.error("Please generate a mnemonic first");
      return;
    }

    if (!isUnlocked) {
      toast.error("Unlock your wallet to generate accounts");
      return;
    }

    setIsGenerating(true);
    try {
      const accountIndex =
        path === WalletPath.SOLANA
          ? solanaWallets.length
          : ethereumWallets.length;

      const walletData = await generateWallet(mnemonic, path, accountIndex);
      await addWallet(
        walletData.type,
        walletData.publicKey,
        walletData.privateKey,
        path
      );
    } catch (error) {
      console.error("Error generating wallet:", error);
      toast.error("Failed to generate wallet. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {mnemonic ? (
        path === WalletPath.SOLANA ? (
          <div className="flex justify-center w-full">
            <Button
              onClick={generateWallets}
              disabled={isGenerating}
              className="w-full sm:w-auto mb-6 py-3 px-6 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="inline-block mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="inline-block mr-2 h-5 w-5" /> Generate SOL
                  Wallet
                </>
              )}
            </Button>
          </div>
        ) : path === WalletPath.ETHEREUM ? (
          <div className="flex justify-center w-full">
            <Button
              onClick={generateWallets}
              disabled={isGenerating}
              className="w-full sm:w-auto mb-6 py-3 px-6 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="inline-block mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="inline-block mr-2 h-5 w-5" /> Generate ETH
                  Wallet
                </>
              )}
            </Button>
          </div>
        ) : null
      ) : null}
      {path === WalletPath.SOLANA && <WalletRenderer wallets={solanaWallets} />}
      {path === WalletPath.ETHEREUM && (
        <WalletRenderer wallets={ethereumWallets} />
      )}
    </>
  );
};

export default SingleWallet;
