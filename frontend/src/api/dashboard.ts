import { apiClient } from "./client";

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

export interface NewsResponse {
  items: NewsItem[];
  usedFallback: boolean;
}

export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  market_cap: number;
}

export interface PricesResponse {
  coins: CoinPrice[];
}

export interface Meme {
  title: string;
  imageUrl: string;
  permalink: string;
  author: string;
  usedFallback?: boolean;
}

export async function fetchNews(): Promise<NewsResponse> {
  const { data } = await apiClient.get<NewsResponse>("/api/news");
  return data;
}

export async function fetchPrices(): Promise<PricesResponse> {
  const { data } = await apiClient.get<PricesResponse>("/api/prices");
  return data;
}

export async function fetchMeme(): Promise<Meme> {
  const { data } = await apiClient.get<Meme>("/api/meme");
  return data;
}
