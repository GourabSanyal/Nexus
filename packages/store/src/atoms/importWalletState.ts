import { atom } from "recoil";
import { ImportWalletSchema } from "@repo/zod/src/walletSchemas/importWalletSchema";
import { importWalletPersistAtom } from "../persistence/recoilPersistConfig";

export const importWalletState = atom<ImportWalletSchema>({
  key: "importWalletState",
  default: {
    isImporting: false,
    currentPhase: "input",
    inputData: {
      seedPhrase: '',
      seedPhraseLength: 12,
      privateKey: '',
      password: '',
      seedPhraseWords: Array(12).fill(''),
    },
    validationErrors: [],
    discoveredWallets: undefined,
    importedWallet: undefined,
  },
  effects_UNSTABLE: [importWalletPersistAtom],
});
