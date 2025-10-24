import { atom } from "recoil";
import { persistAtom } from '../persistence/recoilPersistConfig';

export const walletBalancesState = atom<Record<string, string | BigInt>>({
  key: "walletBalancesState",
  default: {},
  effects_UNSTABLE: [persistAtom],
});


