import { describe, expect, it } from "vitest";
import worker from "../../src/index";
import healthFixture from "../../../../docs/migration/parity/health-response-fixture.json";

describe("thin adapter contract", () => {
  it("exports a fetch handler", () => {
    expect(typeof worker.fetch).toBe("function");
  });

  it("keeps health parity fixture contract", () => {
    expect(healthFixture.route).toBe("/health");
    expect(healthFixture.method).toBe("GET");
    expect(healthFixture.expectedStatus).toBe(200);
    expect(healthFixture.requiredKeys).toEqual(["status", "service", "timestamp"]);
    expect(healthFixture.expectedValues).toMatchObject({
      status: "ok",
      service: "rust-apis",
    });
  });
});
