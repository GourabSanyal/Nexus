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
      privateKey: '',
      password: '',
      seedPhraseWords: Array(12).fill(''),
    },
    validationErrors: [],
    importedWallet: undefined,
  },
  effects_UNSTABLE: [importWalletPersistAtom],
});
