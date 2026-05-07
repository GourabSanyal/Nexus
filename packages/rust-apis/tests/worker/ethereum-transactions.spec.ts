import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import parityFixture from "../../../../docs/migration/parity/ethereum-transactions-response-fixture.json";

describe("ethereum tx-history parity and frontend wiring", () => {
  it("keeps parity fixture contract for transactions endpoint", () => {
    expect(parityFixture.slice).toBe("ethereum-tx-history");
    expect(parityFixture.endpoint).toBe("POST /wallet/ethereum/transactions");
    expect(Array.isArray(parityFixture.response.transactions)).toBe(true);
    expect(parityFixture.response.pagination).toMatchObject({
      has_more: expect.any(Boolean),
      next_cursor: expect.any(String),
      limit: expect.any(Number),
    });
  });

  it("frontend utility targets rust route for ethereum transactions", () => {
    const frontendUtilPath = resolve(
      process.cwd(),
      "../..",
      "apps/web/app/lib/utils/ethereum/transactions/getEthTransactions.ts"
    );
    const source = readFileSync(frontendUtilPath, "utf-8");

    expect(source).toContain("rustApiClient");
    expect(source).toContain('"/wallet/ethereum/transactions"');
  });
});

