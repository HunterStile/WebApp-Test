import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/NavBar';
import Home from './page/Home';
import Dashboard from './page/Dashboard';
import Login from './page/Login';
import PrivateRoute from './components/PrivateRoute';
import AdminPrivateRoute from './components/AdminPrivateRoute';
import AdminLogin from './page/AdminLogin';
import ConversionList from './page/ConversionList';
import CampaignList from './page/CampaingList';
import Admin from './page/private/Admin';
import ManageCampaign from './page/private/ManageCampaign';
import { AuthProvider } from './context/AuthContext';
import { ConversionProvider } from './context/ConversionContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import Footer from './components/Footer';
import Termini from './components/Termini';
import Privacy from './components/Privacy';
import Cookies from './components/Cookies';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ConversionProvider>
        <AdminAuthProvider>
          <Router>
            <div className="App min-h-screen bg-gray-900">
              <Navbar />
              <div className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
                <div className="container mx-auto p-4">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login2" element={<Login />} />
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* Protected routes per utenti normali */}
                    <Route element={<PrivateRoute />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/conversionlist" element={<ConversionList />} />
                      <Route path="/campaignlist" element={<CampaignList />} />
                    </Route>

                    {/* Protected routes per Admin */}
                    <Route element={<AdminPrivateRoute />}>
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/manage" element={<ManageCampaign />} />
                    </Route>

                    {/* Legal routes */}
                    <Route path="/termini" element={<Termini />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/cookie" element={<Cookies />} />
                  </Routes>
                </div>
              </div>
              <Footer />
            </div>
          </Router>
        </AdminAuthProvider>
      </ConversionProvider>
    </AuthProvider>
  );
}

export default App;
