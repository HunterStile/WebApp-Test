// NavBar.js
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

function Navbar() {
  const { user, tcBalance, btcBalance, logout } = useContext(AuthContext);
  const [isBalanceOpen, setIsBalanceOpen] = useState(false);

  const formatTcBalance = (balance) => {
    return Number(balance).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6
    });
  };

  const formatBtcBalance = (satoshiBalance) => {
    const btcValue = satoshiBalance / 100000000;
    return btcValue.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8
    });
  };

  return (
    <div className="fixed top-0 left-0 w-64 bg-gray-800 text-white flex flex-col h-screen">
      <div className="p-4">
        <Link to="/" className="text-2xl font-bold text-orange-500">MyApp</Link>
      </div>
      
      <nav className="flex-1">
        <div className="px-4 space-y-2">
          <Link to="/" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
            Home
          </Link>
          <Link to="/games" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
            Games
          </Link>
          <Link to="/marketplace" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
            MarketPlace
          </Link>
          <Link to="/inventory" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
            Inventario
          </Link>
          <Link to="/casino" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
            Casino
          </Link>
          <Link to="/profile" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
            Profilo
          </Link>
          <Link to="/dashboard" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
            dashboard
          </Link>
          
          
          {/* Expandable sections */}
          <div className="py-2">
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase">More</h3>
            <Link to="/expedition" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
              Expedition
            </Link>
            <Link to="/events" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
              Events
            </Link>
            <Link to="/store" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
              Store
            </Link>
          </div>
        </div>
      </nav>

      {/* User info section at bottom */}
      <div className="p-4 border-t border-gray-700">
        {user ? (
          <div className="space-y-2">
            {/* Balance Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsBalanceOpen(!isBalanceOpen)}
                className="w-full flex items-center justify-between bg-gray-700 px-3 py-2 rounded hover:bg-gray-600"
              >
                <span>Balance</span>
                <ChevronDown size={16} />
              </button>
              
              {isBalanceOpen && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-gray-700 rounded shadow-lg py-1">
                  <div className="px-4 py-2 text-sm">
                    <div>TC: {formatTcBalance(tcBalance)}</div>
                    <div>BTC: {formatBtcBalance(btcBalance)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex flex-col space-y-2">
              <span className="text-sm">{user}</span>
              <button
                onClick={logout}
                className="w-full bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            <Link to="/login2" className="text-center text-gray-300 hover:text-white py-1">Login</Link>
            <Link to="/register" className="text-center bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">Register</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;