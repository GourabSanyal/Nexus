import { useRecoilState, useRecoilValue } from "recoil";
import { walletBalancesState } from "../atoms/walletBalancesState";

export const useWalletBalances = () => {
  const [balances, setBalances] = useRecoilState(walletBalancesState);

  const getBalance = (walletId: number, network: "solana" | "ethereum"): number =>
    balances[`${walletId}-${network}`] ?? 0;

  const setBalance = (
    walletId: number,
    network: "solana" | "ethereum",
    amount: number
  ) => {
    setBalances((prev) => ({ ...prev, [`${walletId}-${network}`]: amount }));
  };

  return { balances, getBalance, setBalance };
};


