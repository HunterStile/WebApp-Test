import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Outlet, Navigate } from 'react-router-dom';
import Navbar from './components/NavBar';
import Home from './page/Home';
import Login from './page/Login';
import NotFound from './page/NotFound';
import PrivateRoute from './components/redirect/PrivateRoute';
import AdminPrivateRoute from './components/redirect/AdminPrivateRoute';
import AdminLogin from './page/private/AdminLogin';
import Admin from './page/private/Admin';
import Dashboard from './page/Dashboard';
import Suppliers from './page/Suppliers';
import Customers from './page/Customers';
import ExternalBatches from './page/ExternalBatches';
import ExternalBatchDetail from './page/ExternalBatchDetail';
import QualityControls from './page/QualityControls';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { AdminAuthProvider, AdminAuthContext } from './context/AdminAuthContext';
import './App.css';

// Layout per utenti non autenticati (senza navbar)
function PublicLayout() {
  return (
    <div className="App min-h-screen bg-gray-50">
      <div className="min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}

// Layout per utenti autenticati (con navbar)
function AuthenticatedLayout() {
  return (
    <div className="App min-h-screen bg-gray-50">
      <Navbar />
      <div className="lg:ml-64 pt-16 lg:pt-0 min-h-screen transition-all duration-300">
        <div className="mx-auto p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

// Componente per reindirizzare gli utenti non autenticati al login
function RequireAuth() {
  const { user } = useContext(AuthContext);
  const { admin } = useContext(AdminAuthContext);

  if (!user && !admin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <Routes>
            {/* Rotte pubbliche con layout senza navbar */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* Pagina 404 - Deve essere inserita nel layout pubblico */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Rotte autenticate con layout con navbar */}
            <Route element={<RequireAuth />}>
              <Route element={<AuthenticatedLayout />}>
                {/* Rotte per utenti normali */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/external-batches" element={<ExternalBatches />} />
                <Route path="/external-batches/:id" element={<ExternalBatchDetail />} />
                <Route path="/external-batches/edit/:id" element={<ExternalBatches />} />
                <Route path="/quality-controls" element={<QualityControls />} />
                <Route path="/quality-controls/:id" element={<QualityControls />} />

                {/* Rotte per admin (protette ulteriormente con AdminPrivateRoute) */}
                <Route element={<AdminPrivateRoute />}>
                  <Route path="/admin" element={<Admin />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
