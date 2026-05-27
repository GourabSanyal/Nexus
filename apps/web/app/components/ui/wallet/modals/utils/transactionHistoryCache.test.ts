import { describe, expect, it } from "vitest";
import { NetworkEnum } from "@my-org/store";
import { TransactionInfo } from "@api-types/TransactionTypes";
import {
  hasCachedTransactions,
  hasHistoryChanged,
  historyCacheKey,
  setTransactionsInHistory,
  readCachedTransactions,
  prependTransactionsToHistory,
  appendTransactionsToHistory,
  getNewestCachedSignature,
  getOldestCachedSignature,
} from "./transactionHistoryCache";

const makeTx = (signature: string): TransactionInfo => ({
  signature,
  slot: 0,
  block_time: Date.now(),
  status: "success",
  err: null,
  confirmation_status: "finalized",
  amount: null,
  fee: null,
  direction: null,
  from_address: null,
  to_address: null,
  memo: null,
});

describe("transactionHistoryCache", () => {
  it("builds stable cache keys", () => {
    expect(historyCacheKey(1, NetworkEnum.Mainnet)).toBe("1:mainnet");
  });

  it("reads and sets transactions per wallet and cluster", () => {
    const empty = readCachedTransactions({}, 2, NetworkEnum.Devnet);
    expect(empty).toEqual([]);

    const txs = [makeTx("abc")];
    const merged = setTransactionsInHistory({}, 2, NetworkEnum.Devnet, txs, null);
    expect(readCachedTransactions(merged, 2, NetworkEnum.Devnet)).toEqual(txs);
    expect(hasCachedTransactions(txs)).toBe(true);
  });

  it("detects history changes by length or newest signature", () => {
    const previous = [makeTx("old")];
    const fetched = [makeTx("new")];
    expect(hasHistoryChanged(previous, fetched)).toBe(true);
    expect(hasHistoryChanged(fetched, [...fetched])).toBe(false);
  });
  
  it("prepends new transactions and deduplicates", () => {
    const existing = [makeTx("tx2"), makeTx("tx1")];
    const store = setTransactionsInHistory({}, 1, NetworkEnum.Mainnet, existing, null);
    
    const newTxs = [makeTx("tx3"), makeTx("tx2")]; // tx2 is duplicate
    const updated = prependTransactionsToHistory(store, 1, NetworkEnum.Mainnet, newTxs);
    
    const result = readCachedTransactions(updated, 1, NetworkEnum.Mainnet);
    expect(result.map(t => t.signature)).toEqual(["tx3", "tx2", "tx1"]);
  });
  
  it("appends older transactions and deduplicates", () => {
    const existing = [makeTx("tx3"), makeTx("tx2")];
    const store = setTransactionsInHistory({}, 1, NetworkEnum.Mainnet, existing, null);
    
    const olderTxs = [makeTx("tx2"), makeTx("tx1")]; // tx2 is duplicate
    const updated = appendTransactionsToHistory(store, 1, NetworkEnum.Mainnet, olderTxs, null);
    
    const result = readCachedTransactions(updated, 1, NetworkEnum.Mainnet);
    expect(result.map(t => t.signature)).toEqual(["tx3", "tx2", "tx1"]);
  });
  
  it("gets newest and oldest cached signatures", () => {
    const txs = [makeTx("newest"), makeTx("middle"), makeTx("oldest")];
    const store = setTransactionsInHistory({}, 1, NetworkEnum.Devnet, txs, null);
    
    expect(getNewestCachedSignature(store, 1, NetworkEnum.Devnet)).toBe("newest");
    expect(getOldestCachedSignature(store, 1, NetworkEnum.Devnet)).toBe("oldest");
  });
});
