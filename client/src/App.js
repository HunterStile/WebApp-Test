// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/NavBar';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import Login from './components/Login';
import Game from './components/Game';
import Marketplace from './components/Marketplace';
import Inventory from './components/Inventory';
import PrivateRoute from './components/PrivateRoute';
import Profile from './components/Profile';
import OddsList from './components/OddsList';
import Casino from './components/Casino';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App flex h-screen">
          <Navbar />
          {/* Aggiungiamo un div spacer per compensare la larghezza della navbar fissa */}
          <div className="w-64 flex-shrink-0"></div>
          <div className="flex-1 bg-gray-900">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login2" element={<Login />} />
              <Route path="/oddslist" element={<OddsList />} />
              
              {/* Rotte protette */}
              <Route element={<PrivateRoute />}>
                <Route path="/games" element={<Game />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/casino" element={<Casino />} />
              </Route>
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;