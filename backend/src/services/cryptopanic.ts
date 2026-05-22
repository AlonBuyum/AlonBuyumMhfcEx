import axios from "axios";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cached } from "./cache.js";
import { config } from "../config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FALLBACK_PATH = path.join(__dirname, "..", "data", "news-fallback.json");

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

interface CryptoPanicPost {
  title: string;
  url: string;
  source?: { title?: string; domain?: string };
  published_at: string;
}

interface CryptoPanicResponse {
  results: CryptoPanicPost[];
}

let fallbackCache: NewsItem[] | null = null;

async function loadFallback(): Promise<NewsItem[]> {
  if (fallbackCache) return fallbackCache;
  const raw = await readFile(FALLBACK_PATH, "utf8");
  fallbackCache = JSON.parse(raw) as NewsItem[];
  return fallbackCache;
}

export async function fetchNews(): Promise<{ items: NewsItem[]; usedFallback: boolean }> {
  if (!config.cryptoPanicKey) {
    const items = await loadFallback();
    return { items, usedFallback: true };
  }

  try {
    return await cached("cryptopanic:news", 300, async () => {
      const { data } = await axios.get<CryptoPanicResponse>(
        "https://cryptopanic.com/api/v1/posts/",
        {
          params: {
            auth_token: config.cryptoPanicKey,
            public: true,
            kind: "news",
            currencies: "BTC,ETH",
            filter: "hot",
          },
          timeout: 8000,
        }
      );
      const items: NewsItem[] = data.results.slice(0, 12).map((post) => ({
        title: post.title,
        url: post.url,
        source: post.source?.title ?? post.source?.domain ?? "Unknown",
        publishedAt: post.published_at,
      }));
      return { items, usedFallback: false };
    });
  } catch (err) {
    console.warn("[cryptopanic] fetch failed, using fallback:", (err as Error).message);
    const items = await loadFallback();
    return { items, usedFallback: true };
  }
}
