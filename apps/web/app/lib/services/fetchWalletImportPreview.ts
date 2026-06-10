import { rustApiClient } from "@api-utils/rustApiClient";
import {
  walletImportPreviewRequestSchema,
  walletImportPreviewSchema,
  type ImportCandidate,
  type WalletImportPreview,
} from "@my-org/zod";

export const fetchWalletImportPreview = async (
  candidates: ImportCandidate[]
): Promise<WalletImportPreview> => {
  const payload = walletImportPreviewRequestSchema.parse({ candidates });
  const client = rustApiClient();
  const response = await client.post("/wallet/import-data", payload);
  return walletImportPreviewSchema.parse(response.data);
};
