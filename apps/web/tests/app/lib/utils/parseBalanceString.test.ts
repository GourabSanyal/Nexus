import { describe, expect, it } from "vitest";
import { parseBalanceString } from "@/app/lib/utils/parseBalanceString";

describe("parseBalanceString", () => {
  it("returns 0 for empty input", () => {
    expect(parseBalanceString("")).toBe(0);
    expect(parseBalanceString("   ")).toBe(0);
  });

  it("parses integer strings as bigint", () => {
    expect(parseBalanceString("1000000000")).toBe(1000000000n);
  });

  it("falls back to number for decimal strings", () => {
    expect(parseBalanceString("1.25")).toBe(1.25);
  });

  it("returns 0 for non-numeric strings", () => {
    expect(parseBalanceString("not-a-balance")).toBe(0);
  });
});
