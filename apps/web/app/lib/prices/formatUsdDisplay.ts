import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";
import type { NativeTokenPrices, NativeTokenSymbol } from "./types";

export const isTestnetNetwork = (network: NetworkEnum): boolean =>
  network === NetworkEnum.Devnet ||
  network === NetworkEnum.Sepolia ||
  network === NetworkEnum.Holesky;

export const nativeSymbolForChain = (chain: ChainEnum): NativeTokenSymbol =>
  chain === ChainEnum.Ethereum ? "ETH" : "SOL";

export const toNativeAmount = (
  chain: ChainEnum,
  balance: number | bigint
): number => {
  if (chain === ChainEnum.Ethereum) {
    const wei =
      typeof balance === "bigint" ? balance : BigInt(Math.trunc(balance));
    return Number(wei) / 1e18;
  }

  const lamports =
    typeof balance === "bigint" ? Number(balance) : Math.trunc(balance);
  return lamports / 1e9;
};

export const formatUsd = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const TESTNET_USD_TITLE =
  "Estimated at mainnet rates. Testnet tokens have no real monetary value.";

export type BalanceUsdDisplay = {
  text: string;
  title?: string;
};

export const formatBalanceUsdDisplay = ({
  chain,
  network,
  nativeBalance,
  formatBalance,
  prices,
}: {
  chain: ChainEnum;
  network: NetworkEnum;
  nativeBalance: number | bigint;
  formatBalance: (balance: number | bigint) => string;
  prices: NativeTokenPrices | null;
}): BalanceUsdDisplay => {
  const symbol = nativeSymbolForChain(chain);
  const cryptoPart = `${formatBalance(nativeBalance)} ${symbol}`;
  const usdEquivalent = formatUsdEquivalent({
    chain,
    network,
    nativeBalance,
    prices,
  });

  if (!usdEquivalent.text) {
    return { text: cryptoPart };
  }

  return {
    text: `${cryptoPart} · ${usdEquivalent.text}`,
    title: usdEquivalent.title,
  };
};

export const formatUsdEquivalent = ({
  chain,
  network,
  nativeBalance,
  prices,
}: {
  chain: ChainEnum;
  network: NetworkEnum;
  nativeBalance: number | bigint;
  prices: NativeTokenPrices | null;
}): { text: string | null; title?: string } => {
  if (!prices) {
    return { text: null };
  }

  const symbol = nativeSymbolForChain(chain);
  const nativeAmount = toNativeAmount(chain, nativeBalance);
  const usdValue = nativeAmount * prices[symbol];
  const isTestnet = isTestnetNetwork(network);

  return {
    text: `${isTestnet ? "≈ " : ""}${formatUsd(usdValue)}`,
    title: isTestnet ? TESTNET_USD_TITLE : undefined,
  };
};
