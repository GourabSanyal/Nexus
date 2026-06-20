import { useCallback, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useSetRecoilState } from "recoil";
import { importWalletState } from "@repo/store/src/atoms/importWalletState";
import { fetchWalletImportPreview } from "@/app/lib/services/fetchWalletImportPreview";
import {
  deriveImportCandidates,
  type KeyedImportCandidate,
} from "@/app/lib/utils/import/deriveImportCandidates";
import {
  clearImportSession,
  saveImportSession,
} from "@/app/lib/utils/import/importSessionStorage";
import { useWalletVault } from "@/app/lib/contexts/WalletVaultContext";

export const useImportWalletFlow = () => {
  const setImportState = useSetRecoilState(importWalletState);
  const { setMnemonic } = useWalletVault();
  const keyedCandidatesRef = useRef<KeyedImportCandidate[]>([]);

  const clearImportCandidates = useCallback(() => {
    keyedCandidatesRef.current = [];
  }, []);

  const clearSecrets = useCallback(() => {
    clearImportCandidates();
    setMnemonic("");
  }, [clearImportCandidates, setMnemonic]);

  useEffect(() => () => clearImportCandidates(), [clearImportCandidates]);

  const runImportFlow = useCallback(
    async (mnemonic: string, maxAccounts?: number) => {
      const trimmed = mnemonic.trim();
      if (!trimmed) {
        throw new Error("Seed phrase is required");
      }

      clearImportSession();

      flushSync(() => {
        setImportState((prev) => ({
          ...prev,
          isImporting: true,
          validationErrors: [],
          selectedImportWallets: [],
          discoveredWallets: undefined,
        }));
      });

      // Let the button spinner paint before CPU/network-heavy import work.
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      try {
        // Keep mnemonic in memory only until the user confirms wallet selection.
        setMnemonic(trimmed);

        const { candidates, keyed } = await deriveImportCandidates(
          trimmed,
          maxAccounts
        );
        keyedCandidatesRef.current = keyed;

        const preview = await fetchWalletImportPreview(candidates);
        const wordCount = trimmed.split(/\s+/).length;
        const seedPhraseLength = wordCount === 24 ? 24 : 12;

        const nextInputData = {
          seedPhrase: trimmed,
          seedPhraseLength: seedPhraseLength as 12 | 24,
        };

        saveImportSession({
          currentPhase: "confirmation",
          discoveredWallets: preview,
          inputData: nextInputData,
        });

        setImportState((prev) => ({
          ...prev,
          isImporting: false,
          currentPhase: "confirmation",
          discoveredWallets: preview,
          validationErrors: [],
          inputData: {
            ...prev.inputData,
            ...nextInputData,
          },
        }));
      } catch (error) {
        clearSecrets();
        clearImportSession();
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
    [clearSecrets, setImportState, setMnemonic]
  );

  return {
    runImportFlow,
    keyedCandidatesRef,
    clearImportCandidates,
    clearSecrets,
  };
};
