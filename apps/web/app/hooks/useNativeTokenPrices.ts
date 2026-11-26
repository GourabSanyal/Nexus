"use client";

import { useEffect, useState } from "react";
import type { NativeTokenPrices } from "@/app/lib/prices/types";

const CLIENT_CACHE_TTL_MS = 60_000;

let clientCache:
  | {
      prices: NativeTokenPrices;
      fetchedAt: number;
    }
  | undefined;

export const useNativeTokenPrices = () => {
  const [prices, setPrices] = useState<NativeTokenPrices | null>(
    clientCache?.prices ?? null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const now = Date.now();

    if (clientCache && now - clientCache.fetchedAt < CLIENT_CACHE_TTL_MS) {
      setPrices(clientCache.prices);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/prices");
        if (!response.ok) {
          throw new Error(`Price fetch failed (${response.status})`);
        }

        const data = (await response.json()) as NativeTokenPrices;

        if (cancelled) {
          return;
        }

        clientCache = { prices: data, fetchedAt: Date.now() };
        setPrices(data);
        setError(null);
      } catch (fetchError) {
        if (cancelled) {
          return;
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load prices"
        );
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { prices, error };
};
