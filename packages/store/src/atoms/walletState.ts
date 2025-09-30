import { atom } from "recoil";
import { WalletSchema } from "@my-org/zod";
import { persistAtom } from '../persistence/recoilPersistConfig';

export const walletState = atom<WalletSchema>({
  key: "walletState",   
  default: {
    mnemonicState: "",
    solanaWallets: [],
    ethereumWallets: [],
    activeTab: "solana" as "solana" | "ethereum",
  },
  effects_UNSTABLE: [persistAtom],
});
