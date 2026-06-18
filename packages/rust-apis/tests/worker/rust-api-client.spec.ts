import { afterEach, describe, expect, it, vi } from "vitest";
import {
  RUST_API_PROXY_PATH,
  resolveRustApiBaseUrl,
} from "../../../api/src/utils/resolveRustApiBaseUrl";

describe("resolveRustApiBaseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the same-origin proxy path in the browser", () => {
    vi.stubGlobal("window", {} as Window);

    expect(resolveRustApiBaseUrl()).toBe(RUST_API_PROXY_PATH);
  });

  it("uses RUST_API_URL on the server", () => {
    vi.stubGlobal("window", undefined);
    vi.stubEnv("RUST_API_URL", "https://worker.example.dev");

    expect(resolveRustApiBaseUrl()).toBe("https://worker.example.dev");
  });

  it("falls back to localhost in development on the server", () => {
    vi.stubGlobal("window", undefined);
    vi.stubEnv("NODE_ENV", "development");

    expect(resolveRustApiBaseUrl()).toBe("http://localhost:9000");
  });
});
