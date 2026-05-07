import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import parityFixture from "../../../../docs/migration/parity/solana-send-response-fixture.json";

describe("solana send parity and frontend wiring", () => {
  it("keeps parity fixture contract for send prepare/send endpoints", () => {
    expect(parityFixture.slice).toBe("solana-send");
    expect(parityFixture.endpoint_prepare).toBe("POST /wallet/solana/send/prepare");
    expect(parityFixture.endpoint_send).toBe("POST /wallet/solana/send");
    expect(parityFixture.response_prepare).toMatchObject({
      chain: "solana",
      cluster: expect.any(String),
      blockhash: expect.any(String),
      lastValidBlockHeight: expect.any(Number),
    });
    expect(parityFixture.response_send).toMatchObject({
      signature: expect.any(String),
    });
  });

  it("frontend send utility targets rust solana send endpoints", () => {
    const frontendUtilPath = resolve(
      process.cwd(),
      "../..",
      "apps/web/app/lib/utils/sendTransaction.ts"
    );
    const source = readFileSync(frontendUtilPath, "utf-8");

    expect(source).toContain("rustApiClient");
    expect(source).toContain('"/wallet/solana/send/prepare"');
    expect(source).toContain('"/wallet/solana/send"');
  });
});

