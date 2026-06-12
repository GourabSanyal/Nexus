import { atom } from "recoil";
import type { WalletPublicSchema } from "@my-org/zod";
import { persistAtom } from '../persistence/recoilPersistConfig';

export const walletState = atom<WalletPublicSchema>({
  key: "walletState",
  default: {
    solanaWallets: [],
    ethereumWallets: [],
    activeTab: "solana",
  },
  effects_UNSTABLE: [persistAtom],
});
