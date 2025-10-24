import { atom } from "recoil";
import { ChainEnum, NetworkEnum } from "../enums/network";
import { persistAtom } from '../persistence/recoilPersistConfig';

// Global default network per chain
export const globalNetworkState = atom<Record<ChainEnum, NetworkEnum>>({
  key: "globalNetworkState",
  default: { [ChainEnum.Solana]: NetworkEnum.Devnet, [ChainEnum.Ethereum]: NetworkEnum.Sepolia },
  effects_UNSTABLE: [persistAtom],
});

// Per-wallet network override: key = `${chain}:${walletId}`
export const walletNetworkOverrideState = atom<Record<string, NetworkEnum>>({
  key: "walletNetworkOverrideState",
  default: {},
  effects_UNSTABLE: [persistAtom],
});


