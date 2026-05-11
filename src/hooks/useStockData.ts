import { useState, useEffect, useCallback } from 'react';
import { StockQuote } from '../types';
import { getStockQuote } from '../lib/api';

export function useStockData(ticker: string | null, refreshInterval = 30000) {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async () => {
    if (!ticker) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getStockQuote(ticker);
      if (data) {
        setQuote(data);
      } else {
        setError('Failed to fetch stock data');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    fetchQuote();
    
    if (refreshInterval > 0 && ticker) {
      const interval = setInterval(fetchQuote, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [ticker, refreshInterval, fetchQuote]);

  return { quote, loading, error, refetch: fetchQuote };
}
