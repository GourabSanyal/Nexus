export function parseBalanceString(balance: string): number | bigint {
  const trimmed = balance.trim();
  if (!trimmed) {
    return 0;
  }

  try {
    return BigInt(trimmed);
  } catch {
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
