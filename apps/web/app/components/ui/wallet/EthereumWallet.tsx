import React from "react";
import SingleWallet from "./SingleWallet";
import {WalletPath} from "@/app/constants/wallet"

const EthereumWallet = () => {
  const ethPath : string = WalletPath.ETHEREUM;
  return (
    <div>
      <SingleWallet path={ethPath} />
    </div>
  );
};

export default EthereumWallet;
