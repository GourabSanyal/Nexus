import React from "react";
import SingleWallet from "./SingleWallet";

interface EthereumWalletProps {
  mnemonic: string;
}
const EthereumWallet = ({ mnemonic }: EthereumWalletProps) => {
  const ethPath : string = "501";
  return (
    <div>
      <SingleWallet mnemonic={mnemonic} path={ethPath} />
    </div>
  );
};

export default EthereumWallet;
