import { useCallback, useEffect, useRef } from "react";
import { useSetRecoilState } from "recoil";
import { importWalletState } from "@repo/store/src/atoms/importWalletState";
import { fetchWalletImportPreview } from "@/app/lib/services/fetchWalletImportPreview";
import {
  deriveImportCandidates,
  type KeyedImportCandidate,
} from "@/app/lib/utils/import/deriveImportCandidates";

export const useImportWalletFlow = () => {
  const setImportState = useSetRecoilState(importWalletState);
  const keyedCandidatesRef = useRef<KeyedImportCandidate[]>([]);

  const clearSecrets = useCallback(() => {
    keyedCandidatesRef.current = [];
  }, []);

  useEffect(() => () => clearSecrets(), [clearSecrets]);

  const runImportFlow = useCallback(
    async (mnemonic: string, maxAccounts?: number) => {
      setImportState((prev) => ({
        ...prev,
        isImporting: true,
        currentPhase: "validation",
        validationErrors: [],
        selectedImportWallets: [],
      }));

      try {
        const { candidates, keyed } = await deriveImportCandidates(
          mnemonic,
          maxAccounts
        );
        keyedCandidatesRef.current = keyed;

        const preview = await fetchWalletImportPreview(candidates);

        setImportState((prev) => ({
          ...prev,
          isImporting: false,
          currentPhase: "confirmation",
          discoveredWallets: preview,
          validationErrors: [],
        }));
      } catch (error) {
        clearSecrets();
        setImportState((prev) => ({
          ...prev,
          isImporting: false,
          currentPhase: "input",
          validationErrors: [
            error instanceof Error ? error.message : "Unknown error",
          ],
        }));
        throw error;
      }
    },
    [clearSecrets, setImportState]
  );

  return { runImportFlow, keyedCandidatesRef, clearSecrets };
};
