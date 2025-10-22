import { formatEther } from "ethers";
import { WalletPath } from "@repo/constants/WalletPaths";

export const LAMPORTS_TO_SOL = 1_000_000_000;

export const convertToDisplayBalance = (
  balance: string | bigint,
  chain: WalletPath.SOLANA | WalletPath.ETHEREUM
): number => {
  const raw = BigInt(balance);

  if (chain == WalletPath.SOLANA) {
    return Number(raw) / LAMPORTS_TO_SOL;
  }

  if (chain == WalletPath.ETHEREUM) {
    return Number(formatEther(raw.toString()));
  }

  throw new Error(`Unsupported chain ${chain}`);
};
