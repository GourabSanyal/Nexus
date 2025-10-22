import React from "react";
import SingleWallet from "./SingleWallet";
import {WalletPath} from "@repo/constants/src/WalletPaths"

const SolanaWallet = () => {
  const solanaPath = WalletPath.SOLANA;
  return (
    <div>
      <SingleWallet path={solanaPath} />
    </div>
  );
};

export default SolanaWallet;
