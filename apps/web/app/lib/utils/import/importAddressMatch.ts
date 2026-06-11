export const importAddressesMatch = (
  left: string,
  right: string,
  chain: "solana" | "ethereum"
): boolean =>
  chain === "ethereum"
    ? left.toLowerCase() === right.toLowerCase()
    : left === right;
