import React from "react";
import SingleWallet from "./SingleWallet";
import { EthereumWalletProps } from "@/app/types/ethWallet";

const EthereumWallet = ({ mnemonic }: EthereumWalletProps) => {
  const ethPath : string = "60";
  return (
    <div>
      <SingleWallet mnemonic={mnemonic} path={ethPath} />
    </div>
  );
};

export default EthereumWallet;
