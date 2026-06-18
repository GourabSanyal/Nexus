import { describe, expect, it } from "vitest";
import { resolveCorsOrigin } from "../../src/cors";

describe("resolveCorsOrigin", () => {
  it("returns * when CORS_ORIGIN is unset", () => {
    expect(resolveCorsOrigin("http://localhost:3000")).toBe("*");
    expect(resolveCorsOrigin(null)).toBe("*");
  });

  it("echoes the request origin when it is in the allowlist", () => {
    const env = "http://localhost:3000,https://nexus-web-umber.vercel.app";

    expect(resolveCorsOrigin("http://localhost:3000", env)).toBe(
      "http://localhost:3000"
    );
    expect(resolveCorsOrigin("https://nexus-web-umber.vercel.app", env)).toBe(
      "https://nexus-web-umber.vercel.app"
    );
  });

  it("does not echo a disallowed request origin", () => {
    const env = "https://nexus-web-umber.vercel.app";

    expect(resolveCorsOrigin("http://localhost:3000", env)).toBe(
      "https://nexus-web-umber.vercel.app"
    );
  });

  it("trims whitespace in the allowlist", () => {
    const env = "http://localhost:3000 , https://example.com";

    expect(resolveCorsOrigin("https://example.com", env)).toBe(
      "https://example.com"
    );
  });
});
