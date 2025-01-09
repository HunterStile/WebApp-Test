import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { Link } from 'react-router-dom';
import { Menu, X, PieChart, BarChart, FileText, MessageCircle, Bell, Briefcase, Calendar, Store, User, Settings } from 'lucide-react';
import flogo from "../assets/images/flogo.png"

function Navbar() {
  const { user, logout: logoutUser } = useContext(AuthContext);
  const { admin, logout: logoutAdmin } = useContext(AdminAuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <span className="font-bold text-[#1F2421]">Fast Affiliation</span>
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
            <span className="font-bold text-[#1F2421]">Fast Affiliation</span>
          </Link>
        </div>

        {/* Mobile spacing */}
        <div className="lg:hidden h-16"></div>

        {/* User info at top */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            <div>
              <p className="text-sm text-gray-500">Affiliate</p>
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
              <Link to="/conversionlist" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <BarChart size={20} />
                <span>Conversions</span>
              </Link>
              <Link to="/campaignlist" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <FileText size={20} />
                <span>Campaigns</span>
              </Link>
              <Link to="/messages" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <MessageCircle size={20} />
                <span>Messages</span>
              </Link>
              <Link to="/announcements" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <Bell size={20} />
                <span>Announcements</span>
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
              <Link to="/admin/allconversion" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <BarChart size={20} />
                <span>All Conversions</span>
              </Link>
              <Link to="/admin/messages" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <MessageCircle size={20} />
                <span>Messages</span>
              </Link>
              <Link to="/admin/announcements" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <Bell size={20} />
                <span>Announcements</span>
              </Link>
            </>
          )}

          {/* More section */}
          <div className="mt-6">
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase mb-2">More</h3>
            <Link to="/affiliations" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
              <Briefcase size={20} />
              <span>Affiliations</span>
            </Link>
            <Link to="/events" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
              <Calendar size={20} />
              <span>Events</span>
            </Link>
            <Link to="/store" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
              <Store size={20} />
              <span>Store</span>
            </Link>
          </div>
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