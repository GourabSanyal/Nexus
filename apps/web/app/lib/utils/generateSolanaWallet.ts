import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";
import { Keypair } from "@solana/web3.js";
import { mnemonicToSeed } from "bip39";
import { SolanaWalletProps } from "@/app/types/wallet/SolanaWalletProps";

export const generateSolanaWallet = async ({
  mnemonic,
  accountIndex,
}: SolanaWalletProps) => {
  const seed = await mnemonicToSeed(mnemonic);
  const solPath = `m/44'/501'/${accountIndex}'/0'`;
  const derivedSeed = derivePath(solPath, seed.toString("hex")).key;
  const secret = nacl.sign.keyPair.fromSeed(
    new Uint8Array(derivedSeed)
  ).secretKey;
  const keypair = Keypair.fromSecretKey(new Uint8Array(secret));
  const solPublicKey = keypair.publicKey.toBase58();
  const solSecretKey = Buffer.from(keypair.secretKey).toString("base64");

  return { solPublicKey, solSecretKey };
};
