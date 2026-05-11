import { StockQuote, SearchResult } from '../types';

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || '';
const BASE_URL = 'https://finnhub.io/api/v1';

export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(`${BASE_URL}/quote?symbol=${symbol.toUpperCase()}&token=${API_KEY}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.c === undefined) return null;
    return data as StockQuote;
  } catch {
    return null;
  }
}

export async function searchStocks(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}&token=${API_KEY}`);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.result || []).filter((r: SearchResult) => r.type === 'Common Stock').slice(0, 10);
  } catch {
    return [];
  }
}
