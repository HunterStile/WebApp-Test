// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/NavBar';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import Login from './components/Login';
import Marketplace from './components/Marketplace';
import Inventory from './components/Inventory';
import PrivateRoute from './components/PrivateRoute';
import Profile from './components/Profile';
import OddsList from './components/OddsList';
import Casino from './components/Casino';
import FlappyBird from './components/games/FlappyBird';
import BrickBreaker from './components/games/BrickBreaker';
import Tetris from './components/games/Tetris';
import WoodyBlockPuzzle from './components/games/BlockPuzzle';

import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-900">
          <Navbar />
          {/* Main content area - adjusted for mobile and desktop */}
          <div className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
            <div className="container mx-auto p-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login2" element={<Login />} />
                <Route path="/oddslist" element={<OddsList />} />
                
                {/* Protected routes */}
                <Route element={<PrivateRoute />}>
                  <Route path="/flappybird" element={<FlappyBird />} />
                  <Route path="/brickbreaker" element={<BrickBreaker />} />
                  <Route path="/tetris" element={<Tetris />} />
                  <Route path="/blockpuzzle" element={<WoodyBlockPuzzle />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/casino" element={<Casino />} />
                </Route>
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;