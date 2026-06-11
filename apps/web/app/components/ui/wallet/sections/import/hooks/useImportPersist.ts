import { useCallback, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { toast } from "sonner";
import type { FlatImportWalletEntry } from "@my-org/zod";
import { walletState } from "@my-org/store";
import { importWalletState } from "@repo/store/src/atoms/importWalletState";
import { walletFlowState } from "@repo/store/src/atoms/walletFlowState";
import {
  createEmptySeedPhraseWords,
  type SeedPhraseLength,
} from "@repo/zod/src/walletSchemas/importWalletSchema";
import { persistImportedWallets } from "@/app/lib/utils/import/persistImportedWallets";
import { useImportWalletSession } from "../ImportWalletSessionContext";

const resetImportWalletState = () => ({
  isImporting: false,
  currentPhase: "complete" as const,
  inputData: {
    seedPhrase: "",
    seedPhraseLength: 12 as SeedPhraseLength,
    seedPhraseWords: createEmptySeedPhraseWords(12),
    privateKey: "",
    password: "",
  },
  validationErrors: [] as string[],
  discoveredWallets: undefined,
  selectedImportWallets: [] as FlatImportWalletEntry[],
  importedWallet: undefined,
});

export const useImportPersist = () => {
  const { keyedCandidatesRef, clearSecrets } = useImportWalletSession();
  const [wallet, setWallet] = useRecoilState(walletState);
  const [importState, setImportState] = useRecoilState(importWalletState);
  const setCurrentFlow = useSetRecoilState(walletFlowState);
  const [isPersisting, setIsPersisting] = useState(false);

  const persistSelection = useCallback(
    async (selected: FlatImportWalletEntry[]) => {
      const mnemonic = importState.inputData.seedPhrase.trim();
      if (!mnemonic) {
        throw new Error("Import session expired. Enter your seed phrase again.");
      }

      setIsPersisting(true);

      try {
        const nextWalletState = persistImportedWallets({
          mnemonic,
          selected,
          keyed: keyedCandidatesRef.current,
          existing: {
            solanaWallets: wallet.solanaWallets,
            ethereumWallets: wallet.ethereumWallets,
          },
        });

        setWallet((prev) => ({
          ...prev,
          ...nextWalletState,
        }));

        clearSecrets();
        setImportState(resetImportWalletState());
        setCurrentFlow("entry");

        const previousSolCount = wallet.solanaWallets?.length ?? 0;
        const previousEthCount = wallet.ethereumWallets?.length ?? 0;
        const importedCount =
          (nextWalletState.solanaWallets?.length ?? 0) -
          previousSolCount +
          ((nextWalletState.ethereumWallets?.length ?? 0) - previousEthCount);

        toast.success(
          `Imported ${importedCount} wallet${importedCount === 1 ? "" : "s"} successfully`
        );
      } finally {
        setIsPersisting(false);
      }
    },
    [
      clearSecrets,
      importState.inputData.seedPhrase,
      keyedCandidatesRef,
      setCurrentFlow,
      setImportState,
      setWallet,
      wallet.ethereumWallets,
      wallet.solanaWallets,
    ]
  );

  return { persistSelection, isPersisting };
};
