import axios from "axios";
import { cached } from "./cache.js";

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

export async function fetchPrices(): Promise<CoinPrice[]> {
  return cached("coingecko:prices", 60, async () => {
    const { data } = await axios.get<CoinPrice[]>(URL, {
      params: {
        vs_currency: "usd",
        ids: COIN_IDS.join(","),
        order: "market_cap_desc",
        per_page: COIN_IDS.length,
        page: 1,
        sparkline: false,
      },
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
}
