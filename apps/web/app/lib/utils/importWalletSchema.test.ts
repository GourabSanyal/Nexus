import { describe, expect, it } from "vitest";
import {
  createEmptySeedPhraseWords,
  importWalletInputSchema,
} from "@my-org/zod";

const VALID_12 =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

describe("importWalletInputSchema", () => {
  it("accepts a valid 12-word mnemonic", () => {
    const words = VALID_12.split(" ");
    const result = importWalletInputSchema.safeParse({
      seedPhraseLength: 12,
      seedPhraseWords: words,
    });
    expect(result.success).toBe(true);
  });

  it("rejects wrong word count for selected length", () => {
    const result = importWalletInputSchema.safeParse({
      seedPhraseLength: 24,
      seedPhraseWords: createEmptySeedPhraseWords(12).fill("abandon"),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid BIP39 mnemonics when all words are filled", () => {
    const result = importWalletInputSchema.safeParse({
      seedPhraseLength: 12,
      seedPhraseWords: createEmptySeedPhraseWords(12).fill("notaword"),
    });
    expect(result.success).toBe(false);
  });

  it("allows partial input without running mnemonic checksum", () => {
    const words = createEmptySeedPhraseWords(12);
    words[0] = "abandon";
    const result = importWalletInputSchema.safeParse({
      seedPhraseLength: 12,
      seedPhraseWords: words,
    });
    expect(result.success).toBe(true);
  });
});
