import { atom } from "recoil";
import { persistAtom } from '../persistence/recoilPersistConfig';

export const walletBalancesState = atom<Record<string, string | bigint>>({
  key: "walletBalancesState",
  default: {},
  effects_UNSTABLE: [persistAtom],
});

