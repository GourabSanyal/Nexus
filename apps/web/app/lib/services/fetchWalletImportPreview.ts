import { rustApiClient } from "@api-utils/rustApiClient";
import {
  walletImportPreviewRequestSchema,
  walletImportPreviewSchema,
  type ImportCandidate,
  type WalletImportPreview,
} from "@my-org/zod";

/** Import scan hits many RPC endpoints; default axios timeout is too short. */
const IMPORT_PREVIEW_TIMEOUT_MS = 120_000;

export const fetchWalletImportPreview = async (
  candidates: ImportCandidate[]
): Promise<WalletImportPreview> => {
  const payload = walletImportPreviewRequestSchema.parse({ candidates });
  const client = rustApiClient();
  const response = await client.post("/wallet/import-data", payload, {
    timeout: IMPORT_PREVIEW_TIMEOUT_MS,
  });
  return walletImportPreviewSchema.parse(response.data);
};
