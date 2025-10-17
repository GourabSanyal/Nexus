import React from "react";
import SingleWallet from "./SingleWallet";
import { WalletPath } from "@/app/constants/wallet";

const SolanaWallet = () => {
  const solanaPath = WalletPath.SOLANA;
  return (
    <div>
      <SingleWallet path={solanaPath} />
    </div>
  );
};

export default SolanaWallet;
