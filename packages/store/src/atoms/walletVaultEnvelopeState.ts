import { atom } from "recoil";
import { vaultPersistAtom } from "../persistence/recoilPersistConfig";

export type WalletVaultEnvelopeState = {
  envelope: Record<string, unknown> | null;
};

export const walletVaultEnvelopeState = atom<WalletVaultEnvelopeState>({
  key: "walletVaultEnvelopeState",
  default: { envelope: null },
  effects_UNSTABLE: [vaultPersistAtom],
});
