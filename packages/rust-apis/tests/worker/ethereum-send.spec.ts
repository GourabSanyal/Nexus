import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import parityFixture from "../../../../docs/migration/parity/ethereum-send-response-fixture.json";

describe("ethereum send parity and frontend wiring", () => {
  it("keeps parity fixture contract for send prepare/send endpoints", () => {
    expect(parityFixture.slice).toBe("ethereum-send");
    expect(parityFixture.endpoint_prepare).toBe("POST /wallet/ethereum/send/prepare");
    expect(parityFixture.endpoint_send).toBe("POST /wallet/ethereum/send");
    expect(parityFixture.response_prepare).toMatchObject({
      chainId: expect.any(String),
      nonce: expect.any(String),
      gasPrice: expect.any(String),
      gasLimit: expect.any(String),
    });
    expect(parityFixture.response_send).toMatchObject({
      signature: expect.any(String),
    });
  });

  it("frontend send utility targets rust ethereum send endpoints", () => {
    const frontendUtilPath = resolve(
      process.cwd(),
      "../..",
      "apps/web/app/lib/utils/sendTransaction.ts"
    );
    const source = readFileSync(frontendUtilPath, "utf-8");

    expect(source).toContain("rustApiClient");
    expect(source).toContain('"/wallet/ethereum/send/prepare"');
    expect(source).toContain('"/wallet/ethereum/send"');
  });
});
