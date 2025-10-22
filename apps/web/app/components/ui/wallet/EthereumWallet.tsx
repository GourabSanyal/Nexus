import React from "react";
import SingleWallet from "./SingleWallet";
import { WalletPath } from "@repo/constants/WalletPaths";

const EthereumWallet = () => {
  const ethPath: string = WalletPath.ETHEREUM;
  return (
    <div>
      <SingleWallet path={ethPath} />
    </div>
  );
};

export default EthereumWallet;
