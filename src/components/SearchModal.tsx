import { useState, useEffect, useRef } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { SearchResult } from '../types';
import { searchStocks } from '../lib/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (result: SearchResult) => void;
  isInWatchlist: (ticker: string) => boolean;
}

export default function SearchModal({ isOpen, onClose, onSelect, isInWatchlist }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        const data = await searchStocks(query);
        setResults(data);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    onSelect(result);
    setQuery('');
    setResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-900/50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full mx-auto overflow-hidden">
          <div className="flex items-center p-4 border-b border-gray-100">
            <Search className="w-5 h-5 text-gray-400 ml-2" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stocks by ticker or name..."
              className="flex-1 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="p-4 text-center text-gray-500">Searching...</div>
            )}

            {!loading && results.length === 0 && query.trim().length >= 2 && (
              <div className="p-4 text-center text-gray-500">No results found</div>
            )}

            {!loading && results.length === 0 && query.trim().length < 2 && (
              <div className="p-4 text-center text-gray-400 text-sm">
                Type at least 2 characters to search
              </div>
            )}

            {results.map((result) => (
              <button
                key={result.symbol}
                onClick={() => handleSelect(result)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-700">
                    {result.displaySymbol.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{result.displaySymbol}</p>
                    <p className="text-sm text-gray-500 truncate max-w-[200px]">
                      {result.description}
                    </p>
                  </div>
                </div>

                {isInWatchlist(result.symbol) ? (
                  <span className="text-xs text-primary font-medium px-2 py-1 bg-primary/10 rounded-full">
                    In Watchlist
                  </span>
                ) : (
                  <Plus className="w-5 h-5 text-gray-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
