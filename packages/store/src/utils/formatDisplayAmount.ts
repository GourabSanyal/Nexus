import { SupportedChain } from "./validateAddress";

const CHAIN_DECIMALS: Record<SupportedChain, number> = {
  ethereum: 18,
  solana: 9,
};

export function getChainAmountDecimals(chain: SupportedChain): number {
  return CHAIN_DECIMALS[chain];
}

export function formatDisplayAmount(
  amount: string | bigint | number | null | undefined,
  chain: SupportedChain,
  displayDecimals: number = 5
): string {
  if (amount === null || amount === undefined) {
    return (0).toFixed(displayDecimals);
  }

  const rawAmount =
    typeof amount === "bigint"
      ? amount
      : typeof amount === "number"
        ? BigInt(Number.isFinite(amount) ? Math.trunc(amount) : 0)
        : BigInt(amount || "0");

  const decimals = getChainAmountDecimals(chain);
  const base = 10n ** BigInt(decimals);
  const divisor = 10n ** BigInt(displayDecimals);
  const whole = rawAmount / base;
  const fraction = ((rawAmount % base) * divisor) / base;

  return `${whole.toString()}.${fraction
    .toString()
    .padStart(displayDecimals, "0")}`;
}
