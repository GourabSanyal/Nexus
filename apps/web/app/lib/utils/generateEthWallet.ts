import { mnemonicToSeed } from "bip39";
import { HDNodeWallet, Wallet } from "ethers";
import { EthereumWalletProps } from "@/app/types/wallet/EthereumWalletProps";

export const generateEthWallet = async ({
  mnemonic,
  path,
}: EthereumWalletProps) => {
  const seed = await mnemonicToSeed(mnemonic);
  const derivationPath = `m/44'/60'/${path}'/0'`;
  const hdNode = HDNodeWallet.fromSeed(new Uint8Array(seed));
  const child = hdNode.derivePath(derivationPath);
  const privateKey = child.privateKey;
  const wallet = new Wallet(privateKey);

  const ethPublicKey = wallet.address;
  const ethPrivateKey = wallet.privateKey;
  return { ethPublicKey, ethPrivateKey };
};
