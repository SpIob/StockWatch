import { Link, useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavBarProps {
  onSearchClick?: () => void;
}

export default function NavBar({ onSearchClick }: NavBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">StockWatch</span>
          </Link>

          <div className="flex items-center space-x-4">
            {onSearchClick && (
              <button
                onClick={onSearchClick}
                className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {user && (
              <>
                <button className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors relative">
                  <Bell className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {user.name || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-negative hover:bg-red-50 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
