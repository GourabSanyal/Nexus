"use client";
import { useEffect, useState } from "react";
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
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";
import { ethers } from "ethers";
import { Keypair } from "@solana/web3.js";

interface SingleWalletProps {
  mnemonic: string;
  path: string;
}

const SingleWallet = ({ mnemonic, path }: SingleWalletProps) => {
  const [solanaWallets, setSolanaWallets] = useState<Wallet[]>([]);
  const [ethereumWallets, setEthereumWallets] = useState<Wallet[]>([]);
  const [showPrivateKey, setShowPrivateKey] = useState<Record<number, boolean>>(
    {}
  );

  useEffect(() => {
    const savedSolanaWallets = localStorage.getItem("solanaWallets");
    const savedEthereumWallets = localStorage.getItem("ethereumWallets");

    if (savedSolanaWallets) {
      setSolanaWallets(JSON.parse(savedSolanaWallets));
    }

    if (savedEthereumWallets) {
      setEthereumWallets(JSON.parse(savedEthereumWallets));
    }
  }, []);

  const generateWallet = async () => {
    const seed = await mnemonicToSeed(mnemonic);
    if (path === "501") {
      console.log("sol wallet called");
      const solPath = `m/44'/${path}'/0'`;
      const derivedSeed = derivePath(solPath, seed.toString("hex")).key;
      const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
      const keypair = Keypair.fromSecretKey(secret);
      const solPublicKey = keypair.publicKey.toBase58();
      const solSsecretKey = Buffer.from(keypair.secretKey).toString("base64");
      addWallet("solana", solPublicKey, solSsecretKey);
    } else if (path === "60") {
      console.log("eth wallet called");
      const ethPath = `m/44'/${path}'/0'`;
      const derivedSeed = derivePath(ethPath, seed.toString("hex")).key;
      const ethPrivateKey = Buffer.from(derivedSeed).toString("hex");
      const wallet = new ethers.Wallet(ethPrivateKey);
      const ethPublicKey = wallet.address;
      addWallet("ethereum", ethPublicKey, ethPublicKey);
    } else {
      toast.warning("There was an issue, please try again after some time");
    }
  };

  const addWallet = (
    type: "solana" | "ethereum",
    publicKey: string,
    privateKey: string
  ) => {
    const newWallet: Wallet = {
      id: Date.now(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Wallet ${path === 'solana' ? solanaWallets.length + 1 : ethereumWallets.length + 1}`,
      publicKey,
      privateKey,
      type,
      mneumonic: "",
      path: "",
    };
    if (type === "solana") {
      const updatedSolanaWallets = [...ethereumWallets, newWallet];
      setSolanaWallets(updatedSolanaWallets);
      localStorage.setItem(
        "solanaWallets",
        JSON.stringify(updatedSolanaWallets)
      );
      toast.success("New Soalana wallet added");
    } else {
      const updatedEthereumWallets = [...ethereumWallets, newWallet];
      setEthereumWallets(updatedEthereumWallets);
      localStorage.setItem(
        "ethereumWallets",
        JSON.stringify(updatedEthereumWallets)
      );
      toast.success("New Ethereum wallet added");
    }
  };

  const deleteWallet = (id: number, type: "solana" | "ethereum") => {
    if (type === "solana") {
      const updatedSolanaWallets = solanaWallets.filter(
        (wallet) => wallet.id !== id
      );
      setSolanaWallets(updatedSolanaWallets);
      localStorage.setItem(
        "solanaWallets",
        JSON.stringify(updatedSolanaWallets)
      );
      toast.success("Solana wallet deleted successfully");
    } else {
      const updatedEthereumWallet = ethereumWallets.filter(
        (wallet) => wallet.id !== id
      );
      setEthereumWallets(updatedEthereumWallet);
      localStorage.setItem(
        "ethereumWallets",
        JSON.stringify(updatedEthereumWallet)
      );
      toast.success("Ethereum wallet deleted successfully");
    }
  };

  const editWalletName = (
    id: number,
    newName: string,
    type: "solana" | "ethereum"
  ) => {
    if (type === "solana") {
      const updatedSolanaWallets = solanaWallets.map((wallet) =>
        wallet.id === id ? { ...wallet, name: newName } : wallet
      );
      setSolanaWallets(updatedSolanaWallets);
      localStorage.setItem(
        "solanaWallets",
        JSON.stringify(updatedSolanaWallets)
      );
      toast.success("Solana wallet name updated successfully");
    } else {
      const updatedEthereumWallets = ethereumWallets.map((wallet) =>
        wallet.id === id ? { ...wallet, name: newName } : wallet
      );
      setEthereumWallets(updatedEthereumWallets);
      localStorage.setItem(
        "ethereumWallets",
        JSON.stringify(updatedEthereumWallets)
      );
      toast.success("Ethereum wallet name updated successfully");
    }
  };

  const copyToClipboard = (text: string, keyType: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${keyType}`);
  };

  const togglePrivateKey = (id: number) => {
    setShowPrivateKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderWallets = (wallets: Wallet[]) => {
    return wallets.map((wallet) => (
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
                  const newName = prompt("Enter new wallet name:", wallet.name);
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
    ));
  };

  return (
    <>
      {mnemonic ? (
        path === "501" ? (
          <Button
            onClick={generateWallet}
            className="w-full sm:w-auto mb-6 py-3 px-6 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-300"
          >
            <Plus className="inline-block mr-2 h-5 w-5" /> Generate SOL Wallet
          </Button>
        ) : path === "60" ? (
          <Button
            onClick={generateWallet}
            className="w-full sm:w-auto mb-6 py-3 px-6 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-300"
          >
            <Plus className="inline-block mr-2 h-5 w-5" /> Generate ETH Wallet
          </Button>
        ) : null
      ) : null}
      {path === "501" && renderWallets(solanaWallets)}
      {path === "60" && renderWallets(ethereumWallets)}
    </>
  );
};

export default SingleWallet;
