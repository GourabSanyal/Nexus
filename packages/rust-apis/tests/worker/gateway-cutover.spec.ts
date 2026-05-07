import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const readFrontendFile = (relativePath: string): string =>
  readFileSync(resolve(process.cwd(), "../..", relativePath), "utf-8");

describe("gateway cutover to rust routes", () => {
  it("wallet frontend utilities use rust api client only", () => {
    const files = [
      "apps/web/app/lib/utils/getSolBalance.ts",
      "apps/web/app/lib/utils/getEthBalance.ts",
      "apps/web/app/lib/utils/getSolTransactions.ts",
      "apps/web/app/lib/utils/ethereum/transactions/getEthTransactions.ts",
      "apps/web/app/lib/utils/sendTransaction.ts",
    ];

    for (const file of files) {
      const source = readFrontendFile(file);
      expect(source).toContain("rustApiClient");
      expect(source).not.toContain("expressApiClient");
    }
  });
});
