import { mnemonicToSeed } from "bip39";
import { HDNodeWallet, Wallet } from "ethers";
import { EthereumWalletProps } from "@/app/types/wallet/EthereumWalletProps";

/** Industry-standard BIP44 ETH path (MetaMask / Ledger). */
export const standardEthDerivationPath = (accountIndex: number): string =>
  `m/44'/60'/${accountIndex}'/0/0`;

export const generateEthWallet = async (props: EthereumWalletProps) => {
  const { mnemonic, accountIndex } = props;
  const seed = await mnemonicToSeed(mnemonic);
  const derivationPath = standardEthDerivationPath(accountIndex);
  const hdNode = HDNodeWallet.fromSeed(new Uint8Array(seed));
  const child = hdNode.derivePath(derivationPath);
  const privateKey = child.privateKey;
  const wallet = new Wallet(privateKey);

  return {
    ethPublicKey: wallet.address,
    ethPrivateKey: wallet.privateKey,
    derivationPath,
  };
};
