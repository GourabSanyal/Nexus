import React from "react";
import SingleWallet from "./SingleWallet";

interface SolanaWalletProps {
  mnemonic: string;
  generateWallet?: () => void;
}

const SolanaWallet = ({ mnemonic }: SolanaWalletProps) => {
  const solanaPath: string = "501";
  return (
    <div>
      <SingleWallet mnemonic={mnemonic} path={solanaPath} />
    </div>
  );
};

export default SolanaWallet;
