import { useState } from 'react';
import { X } from 'lucide-react';
import { PriceAlert } from '../types';

interface PriceAlertFormProps {
  ticker: string;
  currentPrice?: number;
  existingAlert?: PriceAlert | null;
  onSubmit: (alert: { direction: 'above' | 'below'; target_price: number }) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function PriceAlertForm({ ticker, currentPrice, existingAlert, onSubmit, onDelete, onClose }: PriceAlertFormProps) {
  const [direction, setDirection] = useState<'above' | 'below'>(existingAlert?.direction || 'above');
  const [targetPrice, setTargetPrice] = useState(existingAlert?.target_price.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetPrice);
    if (!isNaN(price) && price > 0) {
      onSubmit({ direction, target_price: price });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-900/50" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Price Alert for {ticker}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {existingAlert && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                Current alert: Notify when price goes <span className="font-semibold">{existingAlert.direction}</span>{' '}
                ${existingAlert.target_price.toFixed(2)}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alert me when price goes:
              </label>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setDirection('above')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    direction === 'above'
                      ? 'bg-positive text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Above
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('below')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    direction === 'below'
                      ? 'bg-negative text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Below
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Target Price ($)
              </label>
              <input
                id="targetPrice"
                type="number"
                step="0.01"
                min="0.01"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder={currentPrice ? currentPrice.toFixed(2) : '0.00'}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              {currentPrice && (
                <p className="mt-1 text-xs text-gray-500">
                  Current price: ${currentPrice.toFixed(2)}
                </p>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              {existingAlert && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="px-4 py-3 text-negative font-medium hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete Alert
                </button>
              )}
              <button
                type="submit"
                className="flex-1 bg-primary text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {existingAlert ? 'Update Alert' : 'Create Alert'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
