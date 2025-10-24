import { useRecoilState, useRecoilValue } from "recoil";
import { walletBalancesState } from "../atoms/walletBalancesState";

export const useWalletBalances = () => {
  const [balances, setBalances] = useRecoilState(walletBalancesState);

  const getBalance = (walletId: number, network: "solana" | "ethereum", cluster?: string): string | BigInt => {
    const key = cluster ? `${walletId}-${network}-${cluster}` : `${walletId}-${network}`;
    return balances[key] ?? "0";
  };

  const setBalance = (
    walletId: number,
    network: "solana" | "ethereum",
    amount: string | BigInt,
    cluster?: string
  ) => {
    const key = cluster ? `${walletId}-${network}-${cluster}` : `${walletId}-${network}`;
    setBalances((prev) => ({ ...prev, [key]: amount }));
  };

  return { balances, getBalance, setBalance };
};


