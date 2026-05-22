import axios from "axios";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FALLBACK_PATH = path.join(__dirname, "..", "data", "memes-fallback.json");

export interface Meme {
  title: string;
  imageUrl: string;
  permalink: string;
  author: string;
  usedFallback?: boolean;
}

interface RedditChild {
  data: {
    title: string;
    url: string;
    permalink: string;
    author: string;
    post_hint?: string;
    is_video?: boolean;
    over_18?: boolean;
  };
}

interface RedditResponse {
  data: { children: RedditChild[] };
}

const URL = "https://www.reddit.com/r/cryptomemes/top.json";
const USER_AGENT = "crypto-advisor/1.0 (Moveo take-home demo)";
const IMAGE_RE = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;

let fallbackCache: Meme[] | null = null;

async function loadFallback(): Promise<Meme[]> {
  if (fallbackCache) return fallbackCache;
  const raw = await readFile(FALLBACK_PATH, "utf8");
  fallbackCache = JSON.parse(raw) as Meme[];
  return fallbackCache;
}

function pickFromFallback(memes: Meme[]): Meme {
  const picked = memes[Math.floor(Math.random() * memes.length)];
  return { ...picked, usedFallback: true };
}

export async function fetchRandomMeme(): Promise<Meme> {
  try {
    const { data } = await axios.get<RedditResponse>(URL, {
      params: { t: "day", limit: 25 },
      headers: { "User-Agent": USER_AGENT },
      timeout: 8000,
    });

    const candidates = data.data.children
      .map((child) => child.data)
      .filter((post) => !post.over_18 && !post.is_video)
      .filter((post) => post.post_hint === "image" || IMAGE_RE.test(post.url));

    if (candidates.length > 0) {
      const picked = candidates[Math.floor(Math.random() * candidates.length)];
      return {
        title: picked.title,
        imageUrl: picked.url,
        permalink: `https://reddit.com${picked.permalink}`,
        author: picked.author,
      };
    }

    const fallback = await loadFallback();
    return pickFromFallback(fallback);
  } catch (err) {
    console.warn("[reddit] fetch failed, using fallback:", (err as Error).message);
    const fallback = await loadFallback();
    return pickFromFallback(fallback);
  }
}
