// client/src/components/Navbar.js
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './NavBar.css'; // Assicurati di importare il CSS

function Navbar() {
  const { user, tcBalance, btcBalance, logout } = useContext(AuthContext);

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
            <li>Your TC Balance: {tcBalance}</li>
            <li>Your BTC Balance: {btcBalance} Satoshi</li> {/* Aggiungi il saldo BTC */}
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
