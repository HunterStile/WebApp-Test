// NavBar.js
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, LineChart, Calculator, Settings, LogOut, LogIn, UserPlus } from 'lucide-react';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/oddsmatcher', label: 'Oddsmatcher', icon: LineChart },
    { path: '/doppia_puntata', label: 'Doppia Puntata', icon: Calculator },
    { path: '/tripla_puntata', label: 'Tripla Puntata', icon: Calculator },
  ];

  const moreItems = [
    { path: '/affiliations', label: 'Affiliazioni', icon: Settings },
    { path: '/events', label: 'Eventi', icon: Settings },
    { path: '/store', label: 'Store', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-secondary-900 p-4 flex items-center justify-between z-50 border-b border-secondary-800">
        <Link to="/" className="text-2xl font-bold text-primary-500">BetPro</Link>
        <button
          onClick={toggleMobileMenu}
          className="text-secondary-300 p-2 hover:bg-secondary-800 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`fixed top-0 left-0 w-64 bg-secondary-900 text-white flex flex-col h-screen transition-transform duration-300 ease-in-out z-40 border-r border-secondary-800
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Logo - hidden on mobile since it's in the header */}
        <div className="p-4 hidden lg:block border-b border-secondary-800">
          <Link to="/" className="text-2xl font-bold text-primary-500">BetPro</Link>
        </div>
        
        {/* Add top padding on mobile to account for header */}
        <div className="lg:hidden h-16"></div>
        
        <nav className="flex-1 overflow-y-auto">
          <div className="px-4 space-y-1">
            {/* Main Navigation Items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors
                    ${isActive(item.path)
                      ? 'bg-primary-500/10 text-primary-500'
                      : 'text-secondary-300 hover:bg-secondary-800 hover:text-white'
                    }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
            
            {/* More Section */}
            <div className="py-4">
              <h3 className="px-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">More</h3>
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors
                      ${isActive(item.path)
                        ? 'bg-primary-500/10 text-primary-500'
                        : 'text-secondary-300 hover:bg-secondary-800 hover:text-white'
                      }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* User info section at bottom */}
        <div className="p-4 border-t border-secondary-800">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center px-4 py-2 text-sm text-secondary-300">
                <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center mr-3">
                  <span className="text-primary-500 font-medium">{user[0].toUpperCase()}</span>
                </div>
                <span>{user}</span>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <Link
                to="/login2"
                className="flex items-center px-4 py-2 text-sm text-secondary-300 hover:bg-secondary-800 rounded-lg transition-colors"
              >
                <LogIn className="w-5 h-5 mr-3" />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
              >
                <UserPlus className="w-5 h-5 mr-3" />
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;