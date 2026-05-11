import { Link } from 'react-router-dom';
import { Bell, Trash2 } from 'lucide-react';
import { WatchlistItem, StockQuote, PriceAlert } from '../types';

interface StockCardProps {
  item: WatchlistItem;
  quote: StockQuote | null;
  alert: PriceAlert | null;
  loading?: boolean;
  onRemove?: () => void;
}

export default function StockCard({ item, quote, alert, loading = false, onRemove }: StockCardProps) {
  const isPositive = quote ? quote.d >= 0 : false;
  const isTriggered = alert?.is_triggered || false;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <div
      className={`bg-white rounded-xl p-5 shadow-sm border transition-all hover:shadow-md ${
        isTriggered ? 'border-amber-400 bg-amber-50/30' : 'border-gray-100'
      }`}
    >
      <Link to={`/stock/${item.ticker}`} className="block">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-700">
              {item.ticker.slice(0, 1)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{item.ticker}</h3>
              <p className="text-sm text-gray-500 truncate max-w-[150px] sm:max-w-[200px]">
                {item.company_name}
              </p>
            </div>
          </div>

          {isTriggered && (
            <div className="flex items-center space-x-1 text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
              <Bell className="w-4 h-4" />
              <span className="text-xs font-medium">Alert</span>
            </div>
          )}

          {onRemove && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onRemove();
              }}
              className="p-1.5 text-gray-400 hover:text-negative hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex justify-between items-end">
          <div>
            {loading || !quote ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{formatPrice(quote.c)}</p>
            )}
          </div>

          <div className="text-right">
            {loading || !quote ? (
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              <>
                <p className={`text-sm font-semibold ${isPositive ? 'text-positive' : 'text-negative'}`}>
                  {formatPercent(quote.dp)}
                </p>
                <p className={`text-xs ${isPositive ? 'text-positive' : 'text-negative'}`}>
                  {isPositive ? '+' : ''}{quote.d.toFixed(2)}
                </p>
              </>
            )}
          </div>
        </div>

        {alert && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Alert: {alert.direction === 'above' ? 'Above' : 'Below'} {formatPrice(alert.target_price)}
            </p>
          </div>
        )}
      </Link>
    </div>
  );
}
