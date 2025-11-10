import { atom } from "recoil";
import { persistAtom } from "../persistence/recoilPersistConfig";

export type WalletFlowType = 'entry' | 'import' | 'generate';

export const walletFlowState = atom<WalletFlowType>({
  key: "walletFlowState",
  default: 'entry',
  effects_UNSTABLE: [persistAtom],
});