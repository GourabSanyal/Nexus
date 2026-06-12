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
import { useWalletVault } from "@/app/lib/contexts/WalletVaultContext";

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
  const { importWallets } = useWalletVault();
  const [wallet] = useRecoilState(walletState);
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
        const result = persistImportedWallets({
          mnemonic,
          selected,
          keyed: keyedCandidatesRef.current,
          existing: {
            solanaWallets: wallet.solanaWallets,
            ethereumWallets: wallet.ethereumWallets,
          },
        });

        await importWallets({
          mnemonic: result.mnemonic,
          publicState: result.publicState,
          vaultEntries: result.vaultEntries,
        });

        clearSecrets();
        setImportState(resetImportWalletState());
        setCurrentFlow("entry");

        const previousSolCount = wallet.solanaWallets?.length ?? 0;
        const previousEthCount = wallet.ethereumWallets?.length ?? 0;
        const importedCount =
          (result.publicState.solanaWallets?.length ?? 0) -
          previousSolCount +
          ((result.publicState.ethereumWallets?.length ?? 0) - previousEthCount);

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
      importWallets,
      keyedCandidatesRef,
      setCurrentFlow,
      setImportState,
      wallet.ethereumWallets,
      wallet.solanaWallets,
    ]
  );

  return { persistSelection, isPersisting };
};
