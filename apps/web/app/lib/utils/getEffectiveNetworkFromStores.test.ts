import { describe, expect, it } from "vitest";
import { ChainEnum, NetworkEnum, getEffectiveNetworkFromStores } from "@my-org/store";

describe("getEffectiveNetworkFromStores", () => {
  const globals = {
    [ChainEnum.Solana]: NetworkEnum.Mainnet,
    [ChainEnum.Ethereum]: NetworkEnum.Mainnet,
  };

  it("returns global network when no override exists", () => {
    expect(
      getEffectiveNetworkFromStores(ChainEnum.Solana, 1, globals, {})
    ).toBe(NetworkEnum.Mainnet);
  });

  it("prefers per-wallet override when present", () => {
    const overrides = { [`${ChainEnum.Solana}:1`]: NetworkEnum.Devnet };
    expect(
      getEffectiveNetworkFromStores(ChainEnum.Solana, 1, globals, overrides)
    ).toBe(NetworkEnum.Devnet);
  });
});
