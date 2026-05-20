import { describe, expect, it } from "vitest";
import { ChainEnum, NetworkEnum } from "@my-org/store";
import {
  buildExplorerTransactionUrl,
  buildReceivePaymentUri,
  chainLabelFor,
} from "./chainPresentation";
describe("chainPresentation (adapter internals)", () => {
  it("builds Solana explorer URLs", () => {
    const url = buildExplorerTransactionUrl(
      ChainEnum.Solana,
      "sig123",
      NetworkEnum.Devnet
    );
    expect(url).toContain("explorer.solana.com");
    expect(url).toContain("cluster=devnet");
  });

  it("builds Ethereum receive URIs with chain id", () => {
    const uri = buildReceivePaymentUri(
      ChainEnum.Ethereum,
      "0xabc",
      NetworkEnum.Sepolia
    );
    expect(uri).toBe("ethereum:0xabc?chainId=11155111");
  });

  it("labels chains for UI copy", () => {
    expect(chainLabelFor(ChainEnum.Solana)).toBe("Solana");
    expect(chainLabelFor(ChainEnum.Ethereum)).toBe("Ethereum");
  });
});
