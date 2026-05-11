import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import NavBar from '../components/NavBar';
import PriceAlertForm from '../components/PriceAlertForm';
import { useAuth } from '../hooks/useAuth';
import { useStockData } from '../hooks/useStockData';
import { PriceAlert } from '../types';
import { getAlertForTicker, createAlert as dbCreateAlert, deleteAlert as dbDeleteAlert, updateAlert as dbUpdateAlert } from '../lib/db';

export default function StockDetail() {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { quote, loading, error } = useStockData(ticker || null, 30000);
  const [alert, setAlert] = useState<PriceAlert | null>(null);
  const [alertFormOpen, setAlertFormOpen] = useState(false);

  useEffect(() => {
    if (!user || !ticker) return;

    const loadAlert = async () => {
      const existingAlert = await getAlertForTicker(user.id, ticker);
      if (existingAlert && quote) {
        // Update trigger status
        const isTriggered =
          (existingAlert.direction === 'above' && quote.c >= existingAlert.target_price) ||
          (existingAlert.direction === 'below' && quote.c <= existingAlert.target_price);
        
        if (isTriggered !== existingAlert.is_triggered) {
          existingAlert.is_triggered = isTriggered;
          await dbUpdateAlert(existingAlert);
        }
      }
      setAlert(existingAlert);
    };

    loadAlert();
  }, [user, ticker, quote]);

  const handleCreateAlert = async ({ direction, target_price }: { direction: 'above' | 'below'; target_price: number }) => {
    if (!user || !ticker) return;

    try {
      const newAlert = await dbCreateAlert({
        user_id: user.id,
        ticker,
        direction,
        target_price,
      });
      
      // Check if immediately triggered
      if (quote) {
        const isTriggered =
          (direction === 'above' && quote.c >= target_price) ||
          (direction === 'below' && quote.c <= target_price);
        newAlert.is_triggered = isTriggered;
        await dbUpdateAlert(newAlert);
        setAlert(newAlert);
      } else {
        setAlert(newAlert);
      }
      
      setAlertFormOpen(false);
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  };

  const handleDeleteAlert = async () => {
    if (!alert) return;
    
    try {
      await dbDeleteAlert(alert.id);
      setAlert(null);
      setAlertFormOpen(false);
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return num.toLocaleString();
  };

  if (!ticker) {
    navigate('/');
    return null;
  }

  const isPositive = quote ? quote.d >= 0 : false;

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Watchlist</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-700 text-xl">
                {ticker.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{ticker}</h1>
                <p className="text-gray-500">{quote ? `${quote.c.toFixed(2)} USD` : 'Loading...'}</p>
              </div>
            </div>

            <button
              onClick={() => setAlertFormOpen(true)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                alert
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Bell className="w-5 h-5" />
              <span>{alert ? 'Edit Alert' : 'Set Alert'}</span>
            </button>
          </div>

          {/* Price Display */}
          <div className="mb-8">
            {loading || !quote ? (
              <div className="h-12 w-48 bg-gray-200 rounded animate-pulse" />
            ) : (
              <>
                <p className="text-4xl font-bold text-gray-900">{formatPrice(quote.c)}</p>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`flex items-center text-lg font-semibold ${isPositive ? 'text-positive' : 'text-negative'}`}>
                    {isPositive ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
                    {isPositive ? '+' : ''}{quote.d.toFixed(2)} ({isPositive ? '+' : ''}{quote.dp.toFixed(2)}%)
                  </span>
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
              {error}
            </div>
          )}

          {/* Stats Grid */}
          {quote && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-2 text-gray-500 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Day High</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{formatPrice(quote.h)}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-2 text-gray-500 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Day Low</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{formatPrice(quote.l)}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-2 text-gray-500 mb-1">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Volume</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{quote.v ? formatNumber(quote.v) : 'N/A'}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-2 text-gray-500 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Prev Close</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{formatPrice(quote.pc)}</p>
              </div>
            </div>
          )}

          {/* Active Alert */}
          {alert && (
            <div className={`p-4 rounded-xl border ${alert.is_triggered ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className={`w-5 h-5 ${alert.is_triggered ? 'text-amber-600' : 'text-blue-600'}`} />
                  <div>
                    <p className={`font-medium ${alert.is_triggered ? 'text-amber-800' : 'text-blue-800'}`}>
                      Alert: {alert.direction === 'above' ? 'Above' : 'Below'} {formatPrice(alert.target_price)}
                    </p>
                    {alert.is_triggered && (
                      <p className="text-sm text-amber-600">Condition met!</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setAlertFormOpen(true)}
                  className="text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {alertFormOpen && (
        <PriceAlertForm
          ticker={ticker}
          currentPrice={quote?.c}
          existingAlert={alert}
          onSubmit={handleCreateAlert}
          onDelete={handleDeleteAlert}
          onClose={() => setAlertFormOpen(false)}
        />
      )}
    </div>
  );
}
