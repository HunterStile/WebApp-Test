// client/src/components/Navbar.js
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './NavBar.css';

function Navbar() {
  const { user, tcBalance, btcBalance, logout } = useContext(AuthContext);

  // Funzione per formattare il saldo TC con massimo 6 decimali
  const formatTcBalance = (balance) => {
    return Number(balance).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6
    });
  };

  // Funzione per convertire i satoshi in BTC e formattare con massimo 8 decimali
  const formatBtcBalance = (satoshiBalance) => {
    const btcValue = satoshiBalance / 100000000; // Converti satoshi in BTC
    return btcValue.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8
    });
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">MyApp</Link>
      </div>
      <ul className="navbar-links">
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
            <li>Welcome, {user}</li>
            <li>TC Balance: {formatTcBalance(tcBalance)}</li>
            <li>BTC Balance: {formatBtcBalance(btcBalance)} BTC</li>
            <li><button className="logout-button" onClick={logout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
