import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/NavBar';
import Home from './page/Home';
import Dashboard from './page/Dashboard';
import Login from './page/Login';
import PrivateRoute from './components/redirect/PrivateRoute';
import AdminPrivateRoute from './components/redirect/AdminPrivateRoute';
import AdminLogin from './page/private/AdminLogin';
import UserMessages from './page/UserMessages';
import ConversionList from './page/ConversionList';
import CampaignList from './page/CampaingList';
import Admin from './page/private/Admin';
import AdminMessages from './page/private/AdminMessages';
import ManageCampaign from './page/private/ManageCampaign';
import AllConversion from './page/private/AllConversion';
import UserAnnouncements from './page/Announcements';
import AdminAnnouncements from './page/private/AdminAnnouncement';
import Profile from './page/Profile';
import UserPayments from './page/UserPayments';
import AdminPayments from './page/private/AdminPayments';
import { AuthProvider } from './context/AuthContext';
import { ConversionProvider } from './context/ConversionContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import Footer from './components/Footer';
import Termini from './components/Termini';
import Privacy from './components/Privacy';
import Cookies from './components/Cookies';
import './App.css';

function Layout({ children }) {
  const location = useLocation();

  // Mostra la navbar solo se il percorso non è "/" o "/login2"
  const showNavbar = !['/', '/login2'].includes(location.pathname);

  // Nasconde il footer se il percorso è "/messages o /admin/messages"
  const hiddenPaths = ['/messages', '/admin/messages']; // Aggiungi qui altri percorsi
  const showFooter = !hiddenPaths.includes(location.pathname);

  return (
    <div className="App min-h-screen bg-white">
      {showNavbar && <Navbar />}
      <div className={`${showNavbar ? 'lg:ml-64 pt-16 lg:pt-0' : ''} min-h-screen`}>
        <div className="mx-auto p-4">{children}</div>
      </div>
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ConversionProvider>
        <AdminAuthProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login2" element={<Login />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Protected routes per utenti normali */}
                <Route element={<PrivateRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/conversionlist" element={<ConversionList />} />
                  <Route path="/campaignlist" element={<CampaignList />} />
                  <Route path="/messages" element={<UserMessages />} />
                  <Route path="/announcements" element={<UserAnnouncements />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/payments" element={<UserPayments />} />
                </Route>

                {/* Protected routes per Admin */}
                <Route element={<AdminPrivateRoute />}>
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/manage" element={<ManageCampaign />} />
                  <Route path="/admin/allconversion" element={<AllConversion />} />
                  <Route path="/admin/messages" element={<AdminMessages />} />
                  <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                  <Route path="/admin/payments" element={<AdminPayments />} />
                </Route>

                {/* Legal routes */}
                <Route path="/termini" element={<Termini />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/cookie" element={<Cookies />} />
              </Routes>
            </Layout>
          </Router>
        </AdminAuthProvider>
      </ConversionProvider>
    </AuthProvider>
  );
}

export default App;
