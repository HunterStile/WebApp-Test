import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { Link } from 'react-router-dom';
import { Menu, X, PieChart, BarChart, FileText, MessageCircle, Bell, Briefcase, Calendar, Store, User, Settings } from 'lucide-react';
import flogo from "../assets/images/flogo.png"
import axios from 'axios';

function Navbar() {
  const { user, logout: logoutUser } = useContext(AuthContext);
  const { admin, logout: logoutAdmin } = useContext(AdminAuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  
  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm p-4 flex items-center justify-between z-50">
        <Link to="/" className="flex items-center gap-2">
          <img src={flogo} alt="Fast Affiliation" className="h-8" />
          <span className="font-bold text-[#1F2421]">D.E.G.I APP</span>
        </Link>
        <button
          onClick={toggleMobileMenu}
          className="text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
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
            <img src={flogo} alt="Fast Affiliation" className="h-8" />
            <span className="font-bold text-[#1F2421]">DEGI MARMI</span>
          </Link>
        </div>

        {/* Mobile spacing */}
        <div className="lg:hidden h-16"></div>

        {/* User info at top */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            <div>
              <p className="text-sm text-gray-500">Utente</p>
              <p className="font-medium">{user || admin || 'Guest'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 py-4">
          {/* Regular user links */}
          {user && !admin && (
            <>
              <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <PieChart size={20} />
                <span>Dashboard</span>
              </Link>
              <Link to="/suppliers" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <Store size={20} />
                <span>Fornitori</span>
              </Link>
            </>
          )}

          {/* Admin links */}
          {admin && (
            <>
              <Link to="/admin" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <PieChart size={20} />
                <span>Admin</span>
              </Link>
              <Link to="/admin/manage" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <FileText size={20} />
                <span>Manage</span>
              </Link>
            </>
          )}
        </nav>

        {/* Bottom links */}
        <div className="px-6 py-4 border-t border-gray-200">
          <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
            <User size={20} />
            <span>Profile</span>
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
          {(user || admin) ? (
            <button
              onClick={logout}
              className="w-full mt-4 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login2"
              className="w-full mt-4 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium text-center"
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