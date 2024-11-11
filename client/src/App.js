// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/NavBar';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import About from './components/About';
import Marketplace from './components/Marketplace';
import Inventory from './components/Inventory';
import PrivateRoute from './components/PrivateRoute';
import Profile from './components/Profile';
import OddsList from './components/OddsList';
import Casino from './components/Casino';

import { AuthProvider } from './context/AuthContext'; // Importa il provider

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login2" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oddslist" element={<OddsList />} />
            
            {/* Rotte protette */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/casino" element={<Casino />} />
            </Route>
            
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
