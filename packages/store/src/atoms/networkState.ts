import { atom } from "recoil";
import { ChainEnum, NetworkEnum } from "../enums/network";

// Global default network per chain
export const globalNetworkState = atom<Record<ChainEnum, NetworkEnum>>({
  key: "globalNetworkState",
  default: { [ChainEnum.Solana]: NetworkEnum.Devnet, [ChainEnum.Ethereum]: NetworkEnum.Devnet },
});

// Per-wallet network override: key = `${chain}:${walletId}`
export const walletNetworkOverrideState = atom<Record<string, NetworkEnum>>({
  key: "walletNetworkOverrideState",
  default: {},
});


