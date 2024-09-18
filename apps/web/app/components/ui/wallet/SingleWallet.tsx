"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../button/button";
import { Card, CardHeader, CardTitle, CardContent } from "../card/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "../dialog/dialog";
import { Edit2, Trash, Copy, Eye, EyeOff, Plus } from "lucide-react";
import { Wallet } from "@/app/types/wallet";
import { toast } from "sonner";

interface SingleWalletProps {
  mnemonic: string;
  path: string;
}

const SingleWallet = ({ mnemonic, path }: SingleWalletProps) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [showPrivateKey, setShowPrivateKey] = useState<Record<number, boolean>>(
    {}
  );

  //   console.log("mnemonic in single wallet -> ", mnemonic);
  const generateWallet = () => {
    console.log("gen wallet called");
  };

  const deleteWallet = (id: number) => {
    setWallets(wallets.filter((wallet: Wallet) => wallet.id !== id));
    toast.success("Wallet deleted successfully");
  };

  const editWalletName = (id: number, newName: string) => {
    setWallets(
      wallets.map((wallet: Wallet) =>
        wallet.id === id ? { ...wallet, name: newName } : wallet
      )
    );
    toast.success("Wallet name updated successfully");
  };

  const copyToClipboard = (text: string, keyType: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${keyType}`);
  };

  const togglePrivateKey = (id: number) => {
    setShowPrivateKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  return (
    <>
      {mnemonic ? (
          <Button
            onClick={generateWallet}
            className="w-full sm:w-auto mb-6 py-3 px-6 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-300"
          >
            <Plus className="inline-block mr-2 h-5 w-5" /> Generate SOL Wallet
          </Button>
      ) : null}
      {wallets.map((wallet) => (
        <motion.div
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
                            Sharing your private key with anyone might risk your
                            funds. Are you sure you want to view it?
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
    </>
  );
};

export default SingleWallet;
