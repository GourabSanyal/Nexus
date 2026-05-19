export const decimalToAtomicUnits = (amount: string, decimals: number): bigint => {
  const normalized = amount.trim();

  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    throw new Error("Amount must be a positive decimal number");
  }

  const [whole = "0", fraction = ""] = normalized.split(".");

  if (fraction.length > decimals) {
    throw new Error(`Amount supports up to ${decimals} decimal places`);
  }

  return (
    BigInt(whole) * 10n ** BigInt(decimals) +
    BigInt(fraction.padEnd(decimals, "0") || "0")
  );
};
