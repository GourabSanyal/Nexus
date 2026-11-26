import { NextResponse } from "next/server";
import { fetchNativeTokenPrices } from "@/app/lib/prices/fetchNativeTokenPrices";

const CACHE_TTL_MS = 60_000;

let cached:
  | {
      body: string;
      fetchedAt: number;
    }
  | undefined;

export async function GET() {
  const now = Date.now();

  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return new NextResponse(cached.body, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
    });
  }

  try {
    const prices = await fetchNativeTokenPrices();
    const body = JSON.stringify(prices);

    cached = { body, fetchedAt: now };

    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch token prices";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
