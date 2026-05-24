import axios from "axios";
import Parser from "rss-parser";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cached } from "./cache.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FALLBACK_PATH = path.join(__dirname, "..", "data", "news-fallback.json");
const FEED_URL = "https://www.coindesk.com/arc/outboundfeeds/rss/";

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

const parser = new Parser();

let fallbackCache: NewsItem[] | null = null;

async function loadFallback(): Promise<NewsItem[]> {
  if (fallbackCache) return fallbackCache;
  const raw = await readFile(FALLBACK_PATH, "utf8");
  fallbackCache = JSON.parse(raw) as NewsItem[];
  return fallbackCache;
}

export async function fetchNews(): Promise<{ items: NewsItem[]; usedFallback: boolean }> {
  try {
    return await cached("coindesk:news", 300, async () => {
      const { data } = await axios.get<string>(FEED_URL, {
        responseType: "text",
        timeout: 8000,
        headers: { "User-Agent": "crypto-advisor/1.0" },
      });
      const feed = await parser.parseString(data);
      const items: NewsItem[] = feed.items.slice(0, 12).map((item) => ({
        title: item.title ?? "Untitled",
        url: item.link ?? "#",
        source: "CoinDesk",
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      }));
      return { items, usedFallback: false };
    });
  } catch (err) {
    console.warn("[coindesk] fetch failed, using fallback:", (err as Error).message);
    const items = await loadFallback();
    return { items, usedFallback: true };
  }
}
