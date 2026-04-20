import { formatEther } from "ethers";
import { WalletPath } from "@repo/constants/src/WalletPaths";
import { toast } from "sonner";

export const LAMPORTS_TO_SOL = 1_000_000_000;

export const convertToDisplayBalance = (
  balance: string | bigint,
  chain: WalletPath.SOLANA | WalletPath.ETHEREUM
): number => {
  const raw = BigInt(balance.toString());

  switch (chain) {
    case WalletPath.SOLANA:
      return Number(raw) / LAMPORTS_TO_SOL;
    case WalletPath.ETHEREUM:
      return Number(formatEther(raw.toString()));
    default:
      toast.error(`Unsupported chain ${chain}`);
      throw new Error(`Unsupported chain ${chain}`);
  }
};
