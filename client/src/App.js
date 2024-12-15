import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './page/NavBar';
import Home from './page/Home';
import Login from './page/Login';
import PrivateRoute from './components/PrivateRoute';
import Oddsmatcher from './page/Oddsmatcher';
import ConversionList from './page/ConversionList';
import TriplaPuntata from './page/TriplaPuntata';
import CampaignList from './page/CampaingList';
import Admin from './page/private/Admin';
import ManageCampaign from  './page/private/ManageCampaign';
import { AuthProvider } from './context/AuthContext';
import { ConversionProvider } from './context/ConversionContext'; // Importa ConversionProvider
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ConversionProvider>
        <Router>
          <div className="App min-h-screen bg-gray-900">
            <Navbar />
            {/* Main content area - adjusted for mobile and desktop */}
            <div className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
              <div className="container mx-auto p-4">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login2" element={<Login />} />

                  {/* Protected routes */}
                  <Route element={<PrivateRoute />}>
                    <Route path="/oddsmatcher" element={<Oddsmatcher />} />
                    <Route path="/conversionlist" element={<ConversionList />} />
                    <Route path="/tripla_puntata" element={<TriplaPuntata />} />
                    <Route path="/campaignlist" element={<CampaignList />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/manage" element={<ManageCampaign />} />
                    
                  </Route>
                </Routes>
              </div>
            </div>
          </div>
        </Router>
      </ConversionProvider>
    </AuthProvider>
  );
}

export default App;
