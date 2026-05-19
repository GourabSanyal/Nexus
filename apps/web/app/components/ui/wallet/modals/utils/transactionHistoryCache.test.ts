import { describe, expect, it } from "vitest";
import { NetworkEnum } from "@my-org/store";
import {
  hasCachedTransactions,
  hasHistoryChanged,
  historyCacheKey,
  mergeTransactionsIntoHistory,
  readCachedTransactions,
} from "./transactionHistoryCache";

describe("transactionHistoryCache", () => {
  it("builds stable cache keys", () => {
    expect(historyCacheKey(1, NetworkEnum.Mainnet)).toBe("1:mainnet");
  });

  it("reads and merges transactions per wallet and cluster", () => {
    const empty = readCachedTransactions({}, 2, NetworkEnum.Devnet);
    expect(empty).toEqual([]);

    const txs = [{ signature: "abc", status: "success" as const }];
    const merged = mergeTransactionsIntoHistory(
      {},
      2,
      NetworkEnum.Devnet,
      txs
    );
    expect(readCachedTransactions(merged, 2, NetworkEnum.Devnet)).toEqual(txs);
    expect(hasCachedTransactions(txs)).toBe(true);
  });

  it("detects history changes by length or newest signature", () => {
    const previous = [{ signature: "old", status: "success" as const }];
    const fetched = [{ signature: "new", status: "success" as const }];
    expect(hasHistoryChanged(previous, fetched)).toBe(true);
    expect(hasHistoryChanged(fetched, [...fetched])).toBe(false);
  });
});
