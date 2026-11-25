import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import healthFixture from "../../../../docs/migration/parity/health-response-fixture.json";

const wasmJsPath = resolve(process.cwd(), "_wasm/rust_apis.js");

describe("thin adapter contract", () => {
  it.skipIf(!existsSync(wasmJsPath))(
    "exports a fetch handler when wasm artifacts are built",
    async () => {
      const worker = (await import("../../src/index")).default;
      expect(typeof worker.fetch).toBe("function");
    }
  );

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

  it("worker adapter still declares a fetch export", () => {
    const source = readFileSync(resolve(process.cwd(), "src/index.ts"), "utf-8");
    expect(source).toContain("async fetch(");
    expect(source).toContain("export default");
  });
});
