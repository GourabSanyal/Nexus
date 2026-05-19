import { describe, expect, it } from "vitest";
import { ChainEnum, NetworkEnum } from "@my-org/store";
import {
  buildReceivePaymentUri,
  getChainLabel,
  getCurrencySymbol,
  getExplorerTransactionUrl,
} from "./chainPresentation";

describe("chainPresentation", () => {
  it("returns currency symbols per chain", () => {
    expect(getCurrencySymbol(ChainEnum.Solana)).toBe("SOL");
    expect(getCurrencySymbol(ChainEnum.Ethereum)).toBe("ETH");
  });

  it("builds Solana explorer URLs", () => {
    const url = getExplorerTransactionUrl(
      "sig123",
      ChainEnum.Solana,
      NetworkEnum.Devnet
    );
    expect(url).toContain("explorer.solana.com");
    expect(url).toContain("cluster=devnet");
  });

  it("builds Ethereum receive URIs with chain id", () => {
    const uri = buildReceivePaymentUri(
      "0xabc",
      ChainEnum.Ethereum,
      NetworkEnum.Sepolia
    );
    expect(uri).toBe("ethereum:0xabc?chainId=11155111");
  });

  it("labels chains for UI copy", () => {
    expect(getChainLabel(ChainEnum.Solana)).toBe("Solana");
    expect(getChainLabel(ChainEnum.Ethereum)).toBe("Ethereum");
  });
});
