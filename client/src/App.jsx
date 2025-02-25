import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/NavBar';
import Home from './page/Home';
import Dashboard from './page/Dashboard';
import Auth from './page/Login';
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
import { ThemeProvider } from './context/ThemeContext';
import Footer from './components/Footer';
import Termini from './components/Termini';
import Privacy from './components/Privacy';
import Cookies from './components/Cookies';
import Contact from './page/Contact';
import Faq from './components/Faq';
import { NotFound, Forbidden, ServerError } from './page/error';
import './App.css';

function Layout({ children }) {
  const location = useLocation();

  // Percorsi in cui mostrare la navbar e il footer
  const navbarVisiblePaths = [
    '/dashboard', 
    '/conversionlist', 
    '/campaignlist', 
    '/announcements', 
    '/payments', 
    '/messages',
    '/profile',
    '/admin', 
    '/admin/messages',
    '/admin/manage', 
    '/admin/allconversion', 
    '/admin/announcements', 
    '/admin/payments'
  ];
  
  // Controlla se il percorso corrente è nella lista dei percorsi visibili
  const showNavbar = navbarVisiblePaths.some(path => location.pathname === path);
  
  // Mostra il footer solo in percorsi specifici
  const footerVisiblePaths = [
    '/dashboard', 
    '/conversionlist', 
    '/campaignlist', 
    '/announcements', 
    '/payments', 
    '/termini', 
    '/privacy', 
    '/cookie', 
    '/contact', 
    '/faq', 
    '/admin', 
    '/admin/manage', 
    '/admin/allconversion', 
    '/admin/announcements', 
    '/admin/payments'
  ];
  
  const showFooter = footerVisiblePaths.some(path => location.pathname === path);

  // Percorsi in cui applicare il tema scuro (pagine autenticate)
  const themeEnabledPaths = [
    '/dashboard', 
    '/conversionlist', 
    '/campaignlist', 
    '/messages',
    '/announcements', 
    '/profile',
    '/payments', 
    '/admin', 
    '/admin/manage', 
    '/admin/allconversion', 
    '/admin/messages',
    '/admin/announcements', 
    '/admin/payments'
  ];
  
  // Controlla se il percorso corrente supporta il tema
  const isThemeEnabled = themeEnabledPaths.some(path => location.pathname === path);
  
  // Classe base per tutte le pagine
  const baseClasses = "App min-h-screen";
  
  // Classi aggiuntive solo per le pagine con tema abilitato
  const themeClasses = isThemeEnabled 
    ? "bg-white dark:bg-dark-bg text-black dark:text-dark-text transition-colors duration-300" 
    : "bg-white text-black";

  return (
    <div className={`${baseClasses} ${themeClasses}`}>
      {showNavbar && <Navbar />}
      <div className={`${showNavbar ? 'lg:ml-64 pt-16 lg:pt-0' : ''} min-h-screen`}>
        <div className="mx-auto p-0">{children}</div>
      </div>
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ConversionProvider>
          <AdminAuthProvider>
            <ThemeProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/signup" element={<Auth />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<Faq />} />

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

                  {/* Rotte per errori */}
                  <Route path="/403" element={<Forbidden />} />
                  <Route path="/500" element={<ServerError />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </ThemeProvider>
          </AdminAuthProvider>
        </ConversionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;