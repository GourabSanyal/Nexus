import { useCallback, useEffect, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRecoilState } from "recoil";
import { importWalletState } from "@repo/store/src/atoms/importWalletState";
import {
  createEmptySeedPhraseWords,
  importWalletSchema,
  SEED_PHRASE_LENGTHS,
  type ImportWalletSchema,
  type SeedPhraseLength,
} from "@repo/zod/src/walletSchemas/importWalletSchema";
import { useImportWalletSession } from "../ImportWalletSessionContext";

const parsePastedWords = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[\n,]+/g, " ")
    .split(" ")
    .map((word) => word.replace(/[^a-z]/g, ""))
    .filter((word) => word.length > 0);

const isSeedPhraseLength = (count: number): count is SeedPhraseLength =>
  (SEED_PHRASE_LENGTHS as readonly number[]).includes(count);

/** Recoil persist can freeze nested state; RHF needs mutable copies. */
const cloneImportFormValues = (
  values: ImportWalletSchema
): ImportWalletSchema => ({
  ...values,
  validationErrors: [...values.validationErrors],
  selectedImportWallets: [...values.selectedImportWallets],
  inputData: {
    ...values.inputData,
    seedPhraseWords: [...values.inputData.seedPhraseWords],
  },
});

export const useImportWalletForm = () => {
  const [importState, setImportState] = useRecoilState(importWalletState);
  const { runImportFlow } = useImportWalletSession();

  const methods = useForm<ImportWalletSchema>({
    resolver: zodResolver(importWalletSchema),
    defaultValues: cloneImportFormValues(importState),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    const formPhase = methods.getValues("currentPhase");
    if (importState.currentPhase === formPhase) {
      return;
    }

    // Stay on seed phrase UI while scanning; avoid resetting the form mid-import.
    if (importState.currentPhase === "validation") {
      return;
    }

    methods.reset(cloneImportFormValues(importState));
  }, [importState, methods]);

  useEffect(() => {
    const subscription = methods.watch((formData) => {
      const inputData = formData.inputData;
      if (!inputData?.seedPhraseWords) {
        return;
      }

      const seedPhraseWords = inputData.seedPhraseWords.filter(
        (word): word is string => word !== undefined
      );

      // Only sync seed input fields — never overwrite preview/selection state.
      setImportState((prev) => ({
        ...prev,
        inputData: {
          ...prev.inputData,
          ...inputData,
          seedPhraseWords,
        },
      }));
    });
    return () => subscription.unsubscribe();
  }, [methods, setImportState]);

  const handleSeedPhraseLengthChange = useCallback(
    (length: SeedPhraseLength) => {
      const inputData = methods.getValues("inputData");
      const currentWords = [...(inputData.seedPhraseWords ?? [])];
      const resizedWords = createEmptySeedPhraseWords(length).map(
        (_, index) => currentWords[index] ?? ""
      );

      methods.setValue(
        "inputData",
        {
          ...inputData,
          seedPhraseLength: length,
          seedPhraseWords: resizedWords,
        },
        { shouldValidate: true }
      );
      methods.clearErrors("inputData.seedPhraseWords");
    },
    [methods]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const words = parsePastedWords(e.clipboardData.getData("text"));
      if (words.length === 0) {
        return;
      }

      const targetLength = isSeedPhraseLength(words.length)
        ? words.length
        : methods.getValues("inputData.seedPhraseLength") ?? 12;

      if (words.length > targetLength) {
        methods.setError("inputData.seedPhraseWords", {
          type: "manual",
          message: `Paste contains ${words.length} words. Use ${targetLength} or switch length.`,
        });
        return;
      }

      methods.clearErrors("inputData.seedPhraseWords");

      const inputData = methods.getValues("inputData");
      const newWords = createEmptySeedPhraseWords(targetLength).map(
        (_, index) => words[index] ?? ""
      );

      methods.setValue(
        "inputData",
        {
          ...inputData,
          seedPhraseLength: isSeedPhraseLength(words.length)
            ? words.length
            : inputData.seedPhraseLength,
          seedPhraseWords: newWords,
        },
        { shouldValidate: true }
      );
    },
    [methods]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const currentValue = methods.getValues(
        `inputData.seedPhraseWords.${index}`
      );
      const wordCount = methods.getValues("inputData.seedPhraseLength") ?? 12;
      const lastIndex = wordCount - 1;

      const focusWord = (wordIndex: number) => {
        const input = document.querySelector(
          `input[placeholder="Word ${wordIndex + 1}"]`
        ) as HTMLInputElement | null;
        input?.focus();
      };

      if (e.key === "Backspace" && !currentValue && index > 0) {
        e.preventDefault();
        focusWord(index - 1);
      } else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        focusWord(index - 1);
      } else if (e.key === "ArrowRight" && index < lastIndex) {
        e.preventDefault();
        focusWord(index + 1);
      }
    },
    [methods]
  );

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    flushSync(() => {
      setImportState((prev) => ({
        ...prev,
        isImporting: true,
        validationErrors: [],
      }));
    });

    void methods.handleSubmit(
      async (data) => {
        const mnemonic = data.inputData.seedPhraseWords.join(" ").trim();

        flushSync(() => {
          setImportState((prev) => ({
            ...prev,
            ...data,
            isImporting: true,
            validationErrors: [],
            inputData: {
              ...data.inputData,
              seedPhrase: mnemonic,
            },
          }));
        });

        try {
          await runImportFlow(mnemonic);
        } catch {
          // useImportWalletFlow updates validationErrors and phase
        }
      },
      () => {
        flushSync(() => {
          setImportState((prev) => ({
            ...prev,
            isImporting: false,
          }));
        });
      }
    )(event);
  };

  return {
    methods,
    handlePaste,
    handleKeyDown,
    handleSeedPhraseLengthChange,
    onSubmit,
  };
};
