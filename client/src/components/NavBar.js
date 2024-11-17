import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './NavBar.css';

function Navbar() {
  const { user, tcBalance, btcBalance, logout } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    // Previene lo scroll del body quando la sidebar è aperta
    document.body.style.overflow = !isSidebarOpen ? 'hidden' : 'unset';
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    document.body.style.overflow = 'unset';
  };

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
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">MyApp</Link>
        </div>

        {/* Menu desktop */}
        <ul className="navbar-links-desktop">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/oddslist">OddsList</Link></li>
          {user ? (
            <>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/marketplace">Marketplace</Link></li>
              <li><Link to="/inventory">Inventory</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/casino">Casino</Link></li>
              <li className="user-info">Welcome, {user}</li>
              <li className="balance-info">TC: {formatTcBalance(tcBalance)}</li>
              <li className="balance-info">BTC: {formatBtcBalance(btcBalance)}</li>
              <li><button className="logout-button" onClick={logout}>Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login2">Login</Link></li>
            </>
          )}
        </ul>

        {/* Hamburger per mobile */}
        <button className="menu-toggle" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
      </nav>

      {/* Overlay scuro quando la sidebar è aperta */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      {/* Sidebar mobile */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="close-sidebar" onClick={closeSidebar}>
            <X size={24} />
          </button>
        </div>

        <ul className="sidebar-links">
          <li><Link to="/" onClick={closeSidebar}>Home</Link></li>
          <li><Link to="/about" onClick={closeSidebar}>About</Link></li>
          <li><Link to="/oddslist" onClick={closeSidebar}>OddsList</Link></li>
          {user ? (
            <>
              <li><Link to="/dashboard" onClick={closeSidebar}>Dashboard</Link></li>
              <li><Link to="/marketplace" onClick={closeSidebar}>Marketplace</Link></li>
              <li><Link to="/inventory" onClick={closeSidebar}>Inventory</Link></li>
              <li><Link to="/profile" onClick={closeSidebar}>Profile</Link></li>
              <li><Link to="/casino" onClick={closeSidebar}>Casino</Link></li>
              <li className="sidebar-user-info">
                <div>Welcome, {user}</div>
                <div>TC Balance: {formatTcBalance(tcBalance)}</div>
                <div>BTC Balance: {formatBtcBalance(btcBalance)} BTC</div>
              </li>
              <li>
                <button 
                  className="sidebar-logout-button" 
                  onClick={() => { logout(); closeSidebar(); }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login2" onClick={closeSidebar}>Login</Link></li>
              <li><Link to="/register" onClick={closeSidebar}>Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </>
  );
}

export default Navbar;