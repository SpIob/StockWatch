import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import NavBar from '../components/NavBar';
import StockCard from '../components/StockCard';
import SearchModal from '../components/SearchModal';
import { useAuth } from '../hooks/useAuth';
import { WatchlistItem, SearchResult, PriceAlert, StockQuote } from '../types';
import { getWatchlist, removeFromWatchlist, addToWatchlist, isInWatchlist as checkInWatchlist, getAlertForTicker, updateAlert } from '../lib/db';
import { getStockQuote } from '../lib/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [alerts, setAlerts] = useState<Record<string, PriceAlert>>({});
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  const loadWatchlist = useCallback(async () => {
    if (!user) return;
    
    try {
      const items = await getWatchlist(user.id);
      setWatchlist(items);
      
      // Load alerts and quotes for all watchlist items
      const alertsMap: Record<string, PriceAlert> = {};
      const quotesMap: Record<string, StockQuote> = {};
      
      for (const item of items) {
        const alert = await getAlertForTicker(user.id, item.ticker);
        if (alert) {
          alertsMap[item.ticker] = alert;
        }
        
        const quote = await getStockQuote(item.ticker);
        if (quote) {
          quotesMap[item.ticker] = quote;
          
          // Check if alert should be triggered
          if (alert) {
            const isTriggered = 
              (alert.direction === 'above' && quote.c >= alert.target_price) ||
              (alert.direction === 'below' && quote.c <= alert.target_price);
            
            if (isTriggered !== alert.is_triggered) {
              alert.is_triggered = isTriggered;
              await updateAlert(alert);
              alertsMap[item.ticker] = alert;
            }
          }
        }
      }
      
      setAlerts(alertsMap);
      setQuotes(quotesMap);
    } catch (error) {
      console.error('Failed to load watchlist:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadWatchlist, 30000);
    return () => clearInterval(interval);
  }, [loadWatchlist]);

  const handleSelectStock = async (result: SearchResult) => {
    if (!user) return;
    
    const alreadyInList = await checkInWatchlist(user.id, result.symbol);
    if (alreadyInList) return;
    
    const newItem = await addToWatchlist({
      user_id: user.id,
      ticker: result.displaySymbol,
      company_name: result.description,
    });
    
    setWatchlist(prev => [...prev, newItem]);
  };

  const handleRemoveStock = async (id: string) => {
    await removeFromWatchlist(id);
    setWatchlist(prev => prev.filter(item => item.id !== id));
  };

  const isInWatchlist = (ticker: string): boolean => {
    return watchlist.some(item => item.ticker.toUpperCase() === ticker.toUpperCase());
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar onSearchClick={() => setSearchOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Watchlist</h1>
            <p className="text-gray-500 mt-1">
              {watchlist.length} {watchlist.length === 1 ? 'stock' : 'stocks'} being tracked
            </p>
          </div>
        </div>

        {loading && watchlist.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500">Loading your watchlist...</p>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your watchlist is empty</h3>
            <p className="text-gray-500 mb-6">Start tracking stocks by searching for them</p>
            <button
              onClick={() => setSearchOpen(true)}
              className="bg-primary text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Stock
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlist.map((item) => (
              <StockCard
                key={item.id}
                item={item}
                quote={quotes[item.ticker] || null}
                alert={alerts[item.ticker] || null}
                loading={!quotes[item.ticker]}
                onRemove={() => handleRemoveStock(item.id)}
              />
            ))}
          </div>
        )}
      </main>

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleSelectStock}
        isInWatchlist={isInWatchlist}
      />
    </div>
  );
}
