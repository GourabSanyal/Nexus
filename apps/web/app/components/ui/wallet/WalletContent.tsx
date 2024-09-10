import React, { useState, useEffect } from "react";
import { Copy, Eye, EyeOff, Trash, Edit2 } from "lucide-react";
import { Button } from "../button/button";
import { Card, CardContent, CardHeader, CardTitle } from "../card/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../dialog/dialog";
import { Wallet } from "../../../types/wallet";
import { useTheme } from "../../../lib/utils/ThemeContext";
import { Keypair } from "@solana/web3.js";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import WalletHeader from "../header/WalletHeader";
import { WalletActions } from "../actions/WalletActions";
import { generateMnemonic, mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";

export const CryptoWalletContent = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [showPrivateKey, setShowPrivateKey] = useState<Record<number, boolean>>(
    {}
  );
  const { isDarkMode, toggleTheme } = useTheme();
  const [mneumonic, setMneumonic] = useState<string>("");

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const generateWallet = async () => {
    // genearate a mneumonic
    const mneumonic = generateMnemonic();

    // convert mneumonic to seed
    const seed = await mnemonicToSeed(mneumonic);

    //derivation path fopr solana
    const path = "m/44'/501'/0'";

    // drived seed using bip44 path
    const derivedSeed = derivePath(path, seed.toString("hex")).key;

    // use nacl to generate keypair
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;

    const keypair = Keypair.fromSecretKey(secret);
    const publicKey = keypair.publicKey.toBase58();
    const secretKey = Buffer.from(keypair.secretKey).toString("base64");

    const newWallet = {
      id: Date.now(),
      name: `Wallet ${wallets.length + 1}`,
      publicKey: publicKey,
      privateKey: secretKey,
      mneumonic: mneumonic,
      path: path,
    };
    setWallets([...wallets, newWallet]);
    toast.success("New wallet generated");
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
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${keyType} to clipboard`);
  };

  const togglePrivateKey = (id: number) => {
    setShowPrivateKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="container flex flex-col justify-start min-h-screen transition-colors duration-300">
      <div className="max-w-3xl w-full mx-auto">
        <WalletHeader toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        <WalletActions generateWallet={generateWallet} />
        <AnimatePresence>
          {wallets.map((wallet) => (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="w-full mb-6 border border-border rounded-lg shadow-sm transition-shadow hover:shadow-lg bg-card text-card-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-md font-semibold">
                    {wallet.name}
                  </CardTitle>
                  <div className="flex space-x-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
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
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteWallet(wallet.id)}
                    >
                      <Trash className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        Public Key:
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          copyToClipboard(wallet.publicKey, "public key")
                        }
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="bg-muted p-3 rounded-md overflow-x-auto">
                      <code className="text-xs text-muted-foreground">
                        {wallet.publicKey}
                      </code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        Private Key:
                      </span>
                      <div className="flex space-x-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-foreground"
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
                              <DialogTitle className="text-lg font-semibold">
                                Warning
                              </DialogTitle>
                              <DialogDescription className="text-sm text-muted-foreground">
                                Sharing your private key with anyone might risk
                                your funds. Are you sure you want to view it?
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end">
                              <DialogClose asChild>
                                <Button
                                  onClick={() => togglePrivateKey(wallet.id)}
                                  className="py-2 px-4 bg-destructive text-destructive-foreground font-semibold rounded-lg hover:bg-destructive/90 transition-colors duration-300"
                                >
                                  {showPrivateKey[wallet.id]
                                    ? "Hide Private Key"
                                    : "View Private Key"}
                                </Button>
                              </DialogClose>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            copyToClipboard(wallet.privateKey, "private key")
                          }
                        >
                          <Copy className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-muted p-3 rounded-md overflow-x-auto">
                      <code className="text-xs text-muted-foreground">
                        {showPrivateKey[wallet.id]
                          ? wallet.privateKey
                          : "••••••••••••••••"}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
