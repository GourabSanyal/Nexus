"use client";

import React, { useState, useEffect } from "react";
import { Copy, Eye, EyeOff, Plus, Trash, Edit2 } from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./components/ui/dialog";
import { Wallet } from "./types/wallet";
import { ThemeProvider, useTheme } from "./lib/utils/ThemeContext";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import { Toaster, toast } from 'sonner'


const CryptoWalletContent = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [showPrivateKey, setShowPrivateKey] = useState<Record<number, boolean>>(
    {}
  );
  const { isDarkMode } = useTheme(); 

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

 
  const generateWallet = () => {
    // Generate a new keypair
    const keypair = Keypair.generate();

    // Extract the public and private keys
    const publicKey = keypair.publicKey.toBase58();
    const secretKey = Buffer.from(keypair.secretKey).toString('base64');

    const newWallet = {
      id: Date.now(),
      name: `Wallet ${wallets.length + 1}`,
      publicKey: publicKey,
      privateKey: secretKey,
    };
    setWallets([...wallets, newWallet]);
  };

  const deleteWallet = (id: number) => {
    setWallets(wallets.filter((wallet) => wallet.id !== id));
    toast.success("Wallet deleted successfully");
  };

  const editWalletName = (id: number, newName: string) => {
    setWallets(
      wallets.map((wallet) =>
        wallet.id === id ? { ...wallet, name: newName } : wallet
      )
    );
    toast.success("Wallet name updated successfully");
  };

  const copyToClipboard = (text: string, keyType: string) => {
    console.log("copyToClipboard", text);
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${keyType} to clipboard`);
  };

  const togglePrivateKey = (id: number) => {
    setShowPrivateKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <div className="container flex flex-col justify-start">
        <div className="max-w-3xl w-full mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h1 className="text-2xl font-bold mb-4 sm:mb-0">Nexus</h1>
          </div>

          <Button
            onClick={generateWallet} 
            className="w-full sm:w-auto mb-6 py-3 px-6 bg-gray-200 text-black font-semibold rounded-lg hover:bg-gray-350 transition-colors duration-300"
          >
            <Plus className="inline-block mr-2 h-5 w-5" /> Generate Wallet
          </Button>
          <div className="grid grid-cols-1 gap-6">
            {wallets.map((wallet) => (
              <Card
                key={wallet.id}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-shadow hover:shadow-lg dark:bg-gray-800"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-md font-semibold text-gray-900 dark:text-gray-100">
                    {wallet.name}
                  </CardTitle>
                  <div className="flex space-x-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                      onClick={() => {
                        const newName = prompt(
                          "Enter new wallet name:",
                          wallet.name
                        );
                        if (newName) editWalletName(wallet.id, newName);
                      }}
                    >
                      <Edit2 className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      onClick={() => deleteWallet(wallet.id)}
                    >
                      <Trash className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Public Key:
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        onClick={() => copyToClipboard(wallet.publicKey, "public key")}
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md overflow-x-auto">
                      <code className="text-xs text-gray-800 dark:text-gray-200">
                        {wallet.publicKey}
                      </code>
                    </div>  
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Private Key:
                      </span>
                      <div className="flex space-x-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                            >
                              {showPrivateKey[wallet.id] ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Warning
                              </DialogTitle>
                              <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                                Sharing your private key with anyone might risk
                                your funds. Are you sure you want to view it?
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end">
                              <DialogClose asChild>
                                <Button
                                  onClick={() => togglePrivateKey(wallet.id)}
                                  className="py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors duration-300"
                                >
                                  {showPrivateKey[wallet.id] ? "Hide Private Key" : "View Private Key"}
                                </Button>
                              </DialogClose>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                          onClick={() => copyToClipboard(wallet.privateKey, "private key")}
                        >
                          <Copy className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md overflow-x-auto">
                      <code className="text-xs text-gray-800 dark:text-gray-200">
                        {showPrivateKey[wallet.id]
                          ? wallet.privateKey
                          : "••••••••••••••••"}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const CryptoWallet = () => {
  return (
    <ThemeProvider>
      <Toaster />
      <CryptoWalletContent />
    </ThemeProvider>
  );
};

export default CryptoWallet;
