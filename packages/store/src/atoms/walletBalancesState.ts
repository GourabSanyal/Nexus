import { atom } from "recoil";

export const walletBalancesState = atom<Record<string, number>>({
  key: "walletBalancesState",
  default: {},
});


