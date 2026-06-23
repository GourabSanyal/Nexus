import { describe, expect, it } from "vitest";
import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";
import {
  formatBalanceUsdDisplay,
  formatUsdEquivalent,
  isTestnetNetwork,
  toNativeAmount,
} from "@/app/lib/prices/formatUsdDisplay";
import type { NativeTokenPrices } from "@/app/lib/prices/types";

const prices: NativeTokenPrices = {
  ETH: 3000,
  SOL: 150,
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("formatUsdDisplay", () => {
  it("marks devnet and sepolia as testnets", () => {
    expect(isTestnetNetwork(NetworkEnum.Devnet)).toBe(true);
    expect(isTestnetNetwork(NetworkEnum.Sepolia)).toBe(true);
    expect(isTestnetNetwork(NetworkEnum.Mainnet)).toBe(false);
  });

  it("converts wei and lamports to native amounts", () => {
    expect(toNativeAmount(ChainEnum.Ethereum, 1_500_000_000_000_000_000n)).toBe(
      1.5
    );
    expect(toNativeAmount(ChainEnum.Solana, 2_000_000_000)).toBe(2);
  });

  it("shows approximate USD on testnets", () => {
    const result = formatUsdEquivalent({
      chain: ChainEnum.Ethereum,
      network: NetworkEnum.Sepolia,
      nativeBalance: 1_000_000_000_000_000_000n,
      prices,
    });

    expect(result.text).toBe("≈ $3,000.00");
    expect(result.title).toContain("Testnet");
  });

  it("shows exact USD on mainnet", () => {
    const result = formatBalanceUsdDisplay({
      chain: ChainEnum.Solana,
      network: NetworkEnum.Mainnet,
      nativeBalance: 2_000_000_000,
      formatBalance: (balance) =>
        (Number(balance) / 1e9).toFixed(3),
      prices,
    });

    expect(result.text).toBe("2.000 SOL · $300.00");
    expect(result.title).toBeUndefined();
  });
});
