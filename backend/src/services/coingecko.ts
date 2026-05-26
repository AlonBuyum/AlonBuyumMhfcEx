import axios from "axios";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cached } from "./cache.js";
import { config } from "../config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FALLBACK_PATH = path.join(__dirname, "..", "data", "prices-fallback.json");

export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  market_cap: number;
}

const COIN_IDS = ["bitcoin", "ethereum", "solana", "cardano", "ripple", "dogecoin"];
const URL = "https://api.coingecko.com/api/v3/coins/markets";

let fallbackCache: CoinPrice[] | null = null;

async function loadFallback(): Promise<CoinPrice[]> {
  if (fallbackCache) return fallbackCache;
  const raw = await readFile(FALLBACK_PATH, "utf8");
  fallbackCache = JSON.parse(raw) as CoinPrice[];
  return fallbackCache;
}

export async function fetchPrices(): Promise<{ coins: CoinPrice[]; usedFallback: boolean }> {
  try {
    const coins = await cached("coingecko:prices", 60, async () => {
      const { data } = await axios.get<CoinPrice[]>(URL, {
        params: {
          vs_currency: "usd",
          ids: COIN_IDS.join(","),
          order: "market_cap_desc",
          per_page: COIN_IDS.length,
          page: 1,
          sparkline: false,
        },
        // CoinGecko blocks shared datacenter IPs (e.g. Render). A free Demo
        // API key fixes that. without one we fall back to hardcoded placeholder data.
        headers: config.coingeckoKey ? { "x-cg-demo-api-key": config.coingeckoKey } : undefined,
        timeout: 8000,
      });
      return data.map((coin) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap: coin.market_cap,
      }));
    });
    return { coins, usedFallback: false };
  } catch (err) {
    console.warn("[coingecko] fetch failed, using fallback:", (err as Error).message);
    const coins = await loadFallback();
    return { coins, usedFallback: true };
  }
}
