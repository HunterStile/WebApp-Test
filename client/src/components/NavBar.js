import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, PieChart, BarChart, FileText, MessageCircle, Bell, Briefcase, Calendar, Store, User, Settings, LogOut, Leaf, Users } from 'lucide-react';
import flogo from "../assets/images/flogo.png"
import axios from 'axios';

function Navbar() {
  const { user, logout: logoutUser } = useContext(AuthContext);
  const { admin, logout: logoutAdmin } = useContext(AdminAuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const logout = () => {
    if (admin) {
      logoutAdmin();
    } else {
      logoutUser();
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm p-4 flex items-center justify-between z-50">
        <Link to="/" className="flex items-center gap-2">
          <img src={flogo} alt="HACCP" className="h-8" />
          <span className="font-bold text-primary-800">HACCP</span>
        </Link>
        <button
          onClick={toggleMobileMenu}
          className="text-gray-600 p-2 hover:bg-primary-50 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`fixed top-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col h-screen transition-transform duration-300 ease-in-out z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        {/* Logo */}
        <div className="p-6 hidden lg:block">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary-600 h-8 w-8 rounded-md flex items-center justify-center">
              <Leaf size={20} className="text-white" />
            </div>
            <span className="font-bold text-primary-800">HACCP APP</span>
          </Link>
        </div>

        {/* Mobile spacing */}
        <div className="lg:hidden h-16"></div>

        {/* User info at top */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Utente</p>
              <p className="font-medium text-tertiary-800">{user || admin || 'Guest'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 py-4">
          {/* Regular user links */}
          {user && !admin && (
            <>
              <Link to="/dashboard" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                  isActive('/dashboard') 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <PieChart size={20} />
                <span>Dashboard</span>
              </Link>
              <Link to="/suppliers" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                  isActive('/suppliers') 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <Store size={20} />
                <span>Fornitori</span>
              </Link>
              <Link to="/customers" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                  isActive('/customers') 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <Users size={20} />
                <span>Clienti</span>
              </Link>
              <Link to="/external-batches" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                  isActive('/external-batches') 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <Briefcase size={20} />
                <span>Lotti Esterni</span>
              </Link>
              <Link to="/quality-controls" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                  isActive('/quality-controls') 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <FileText size={20} />
                <span>Controlli Qualità</span>
              </Link>
            </>
          )}

          {/* Admin links */}
          {admin && (
            <>
              <Link to="/admin" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                  isActive('/admin') 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <PieChart size={20} />
                <span>Admin</span>
              </Link>
              <Link to="/admin/manage" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                  isActive('/admin/manage') 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <FileText size={20} />
                <span>Manage</span>
              </Link>
            </>
          )}
        </nav>

        {/* Bottom links */}
        <div className="px-6 py-4 border-t border-gray-200">
          <Link to="/profile" 
            className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
              isActive('/profile') 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}>
            <User size={20} />
            <span>Profile</span>
          </Link>
          <Link to="/settings" 
            className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
              isActive('/settings') 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}>
            <Settings size={20} />
            <span>Settings</span>
          </Link>
          {(user || admin) ? (
            <button
              onClick={logout}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="w-full mt-4 bg-primary-50 text-primary-600 hover:bg-primary-100 px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;