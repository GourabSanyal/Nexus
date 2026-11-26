import type { NativeTokenPrices } from "./types";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana&vs_currencies=usd";

const fetchFromCoinGecko = async (): Promise<NativeTokenPrices> => {
  const response = await fetch(COINGECKO_URL, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko price fetch failed (${response.status})`);
  }

  const data = (await response.json()) as {
    ethereum?: { usd?: number };
    solana?: { usd?: number };
  };

  const eth = data.ethereum?.usd;
  const sol = data.solana?.usd;

  if (eth == null || sol == null) {
    throw new Error("CoinGecko response missing ETH or SOL price");
  }

  return {
    ETH: eth,
    SOL: sol,
    updatedAt: new Date().toISOString(),
  };
};

const fetchFromAlchemy = async (apiKey: string): Promise<NativeTokenPrices> => {
  const url = `https://api.g.alchemy.com/prices/v1/${apiKey}/tokens/by-symbol?symbols=ETH,SOL`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Alchemy price fetch failed (${response.status})`);
  }

  const body = (await response.json()) as {
    data?: Array<{
      symbol: string;
      prices?: Array<{ currency: string; value: string }>;
    }>;
  };

  const bySymbol = new Map(
    (body.data ?? []).map((entry) => [entry.symbol, entry.prices?.[0]?.value])
  );

  const eth = Number(bySymbol.get("ETH"));
  const sol = Number(bySymbol.get("SOL"));

  if (!Number.isFinite(eth) || !Number.isFinite(sol)) {
    throw new Error("Alchemy response missing ETH or SOL price");
  }

  return {
    ETH: eth,
    SOL: sol,
    updatedAt: new Date().toISOString(),
  };
};

export const fetchNativeTokenPrices = async (): Promise<NativeTokenPrices> => {
  const alchemyKey = process.env.ALCHEMY_API_KEY?.trim();

  if (alchemyKey) {
    try {
      return await fetchFromAlchemy(alchemyKey);
    } catch {
      // Fall through to CoinGecko when Alchemy fails or key is misconfigured.
    }
  }

  return fetchFromCoinGecko();
};
