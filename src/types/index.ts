export interface StockQuote {
  c: number; // current price
  d: number; // change
  dp: number; // percent change
  h: number; // day high
  l: number; // day low
  o: number; // open price
  pc: number; // previous close
  t: number; // timestamp
}

export interface SearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  ticker: string;
  company_name: string;
  added_at: string;
}

export interface PriceAlert {
  id: string;
  user_id: string;
  ticker: string;
  direction: 'above' | 'below';
  target_price: number;
  is_triggered: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}
