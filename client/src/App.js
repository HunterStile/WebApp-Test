import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/NavBar';
import Home from './page/Home';
import Login from './page/Login';
import PrivateRoute from './components/redirect/PrivateRoute';
import AdminPrivateRoute from './components/redirect/AdminPrivateRoute';
import AdminLogin from './page/private/AdminLogin';
import Admin from './page/private/Admin';
import Dashboard from './page/Dashboard';
import Suppliers from './page/Suppliers';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import './App.css';

function Layout({ children }) {
  const location = useLocation();

  // Mostra la navbar solo se il percorso non è "/" o "/login2"
  const showNavbar = !['/login2'].includes(location.pathname);

  
  return (
    <div className="App min-h-screen bg-white">
      {showNavbar && <Navbar />}
      <div className={`${showNavbar ? 'lg:ml-64 pt-16 lg:pt-0' : ''} min-h-screen`}>
        <div className="mx-auto p-4">{children}</div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
        <AdminAuthProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login2" element={<Login />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/suppliers" element={<Suppliers />} />

                {/* Protected routes per utenti normali */}
                <Route element={<PrivateRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                </Route>
                {/* Protected routes per Admin */}
                <Route element={<AdminPrivateRoute />}>
                  <Route path="/admin" element={<Admin />} />
                </Route>

              </Routes>
            </Layout>
          </Router>
        </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
