import { ChainEnum } from "@my-org/store";

const LAMPORTS_PER_SOL = 1_000_000_000;

export const formatAmount = (amount: number | null, chain?: ChainEnum): string => {
  if (amount === null) return "0";
  if (chain === ChainEnum.Ethereum) {
    return Math.abs(amount).toFixed(8);
  }
  const sol = Math.abs(amount) / LAMPORTS_PER_SOL;
  return sol.toFixed(8);
};

export const formatDate = (timestamp: number | null): string => {
  if (!timestamp) return "Unknown";
  return new Date(timestamp * 1000).toLocaleString();
};

export const truncateSignature = (signature: string, length: number = 8): string => {
  if (signature.length <= length * 2) return signature;
  return `${signature.slice(0, length)}...${signature.slice(-length)}`;
};

