import { z } from "zod";
import { walletImportPreviewSchema } from "@my-org/zod";

const IMPORT_SESSION_KEY = "nexus:import-wallet-session";

const importSessionSchema = z.object({
  currentPhase: z.literal("confirmation"),
  discoveredWallets: walletImportPreviewSchema,
  inputData: z.object({
    seedPhrase: z.string(),
    seedPhraseLength: z.union([z.literal(12), z.literal(24)]),
  }),
});

export type ImportSessionSnapshot = z.infer<typeof importSessionSchema>;

export const saveImportSession = (snapshot: ImportSessionSnapshot): void => {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(IMPORT_SESSION_KEY, JSON.stringify(snapshot));
};

export const restoreImportSession = (): ImportSessionSnapshot | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(IMPORT_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return importSessionSchema.parse(JSON.parse(raw));
  } catch {
    sessionStorage.removeItem(IMPORT_SESSION_KEY);
    return null;
  }
};

export const clearImportSession = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(IMPORT_SESSION_KEY);
};

export const hasImportSessionKey = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return sessionStorage.getItem(IMPORT_SESSION_KEY) !== null;
};

export const hasPendingImportSession = (): boolean =>
  restoreImportSession() !== null;
