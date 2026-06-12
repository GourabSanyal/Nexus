import { describe, expect, it } from "vitest";
import { walletImportPreviewRequestSchema } from "@my-org/zod";

describe("walletImportPreviewRequestSchema", () => {
  it("accepts candidates-only payload", () => {
    const result = walletImportPreviewRequestSchema.safeParse({
      candidates: [
        {
          chain: "solana",
          address: "GoXSRkGKExFuWgtfXdpyyfRsvsuFQurrzgqgXbxNpxup",
          derivationPath: "m/44'/501'/1'/0'",
          scheme: "standard",
          accountIndex: 1,
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("rejects legacy seedPhrase-only body", () => {
    const result = walletImportPreviewRequestSchema.safeParse({
      seedPhrase:
        "athlete reason combine sponsor verb clay ghost melt art invest often saddle",
      maxAccounts: 3,
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty candidates", () => {
    const result = walletImportPreviewRequestSchema.safeParse({
      candidates: [],
    });

    expect(result.success).toBe(false);
  });
});
