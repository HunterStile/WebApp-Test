import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { Link } from 'react-router-dom';
import { Menu, X, PieChart, BarChart, FileText, MessageCircle, Bell, ReceiptEuro, User, Settings } from 'lucide-react';
import flogo from "../assets/images/flogo.png"
import API_BASE_URL from '../config';
import axios from 'axios';

function Navbar() {
  const { user, logout: logoutUser } = useContext(AuthContext);
  const { admin, logout: logoutAdmin } = useContext(AdminAuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileImage, setProfileImage] = useState(null);

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

  const updateUnreadCount = async () => {
    if (user) {
      try {
        const response = await axios.get(`${API_BASE_URL}/threads/unread-count/${user}`);
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    }
  };

  useEffect(() => {
    if (window) {
      window.updateNavbarUnreadCount = updateUnreadCount;
    }
    return () => {
      if (window) {
        delete window.updateNavbarUnreadCount;
      }
    };
  }, [user]);

  useEffect(() => {
    updateUnreadCount();
    const interval = setInterval(updateUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);
  

  useEffect(() => {
    if (user) {
      axios.get(`${API_BASE_URL}/auth/profile?username=${user}`)
        .then((response) => {
          const userData = response.data.user;
          setProfileImage(
            userData.profileImage 
            ? `${API_BASE_URL}/${userData.profileImage}` 
            : null
          );
        })
        .catch((error) => {
          console.error('Error fetching profile:', error);
        });
    }
  }, [user]);
  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-dark-bg dark:border-b dark:border-dark-accent shadow-sm p-4 flex items-center justify-between z-50">
        <Link to="/" className="flex items-center gap-2">
          <img src={flogo} alt="Fast Affiliation" className="h-8" />
          <span className="font-bold text-[#1F2421] dark:text-dark-text">Fast Affiliation</span>
        </Link>
        <button
          onClick={toggleMobileMenu}
          className="text-gray-600 dark:text-dark-text p-2 hover:bg-gray-100 dark:hover:bg-dark-accent rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`fixed top-0 left-0 w-64 bg-white dark:bg-dark-bg border-r border-gray-200 dark:border-dark-accent flex flex-col h-screen transition-transform duration-300 ease-in-out z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        {/* Logo */}
        <div className="p-6 hidden lg:block">
          <Link to="/dashboard" className="flex items-center gap-2">
          {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400 dark:text-gray-500 mb-1">
                  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M3 22C3 17.0294 7.02944 13 12 13C16.9706 13 21 17.0294 21 22" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className="text-xs text-gray-500 dark:text-gray-400">Upload your</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">photo</span>
              </>
            )}
            <span className="font-bold text-[#1F2421] dark:text-dark-text">Fast Affiliation</span>
          </Link>
        </div>

        {/* Mobile spacing */}
        <div className="lg:hidden h-16"></div>

        {/* User info at top */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-dark-accent"></div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Affiliate</p>
              <p className="font-medium text-black dark:text-dark-text">{user || admin || 'Guest'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 py-4">
          {/* Regular user links */}
          {user && !admin && (
            <>
              <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-accent rounded-lg mb-1">
                <PieChart size={20} />
                <span>Dashboard</span>
              </Link>
              <Link to="/conversionlist" className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-accent rounded-lg mb-1">
                <BarChart size={20} />
                <span>Conversions</span>
              </Link>
              <Link to="/campaignlist" className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-accent rounded-lg mb-1">
                <FileText size={20} />
                <span>Campaigns</span>
              </Link>
              <Link to="/messages" className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-accent rounded-lg mb-1">
                <div className="relative">
                  <MessageCircle size={20} />
                  {unreadCount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </div>
                <span>Messages</span>
              </Link>
              <Link to="/announcements" className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-accent rounded-lg mb-1">
                <Bell size={20} />
                <span>Announcements</span>
              </Link>
              <Link to="/payments" className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-accent rounded-lg mb-1">
                <ReceiptEuro size={20} />
                <span>Payments</span>
              </Link>
            </>
          )}

          {/* Admin links */}
          {admin && (
            <>
              <Link to="/admin" className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-accent rounded-lg mb-1">
                <PieChart size={20} />
                <span>Admin</span>
              </Link>
              <Link to="/admin/manage" className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-accent rounded-lg mb-1">
                <FileText size={20} />
                <span>Manage</span>
              </Link>
              <Link to="/admin/allconversion" className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-accent rounded-lg mb-1">
                <BarChart size={20} />
                <span>All Conversions</span>
              </Link>
              <Link to="/admin/messages" className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-accent rounded-lg mb-1">
                <MessageCircle size={20} />
                <span>Messages</span>
              </Link>
              <Link to="/admin/announcements" className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-accent rounded-lg mb-1">
                <Bell size={20} />
                <span>Announcements</span>
              </Link>
            </>
          )}
        </nav>

        {/* Bottom links */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-accent">
          <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-accent rounded-lg mb-1">
            <User size={20} />
            <span>Profile</span>
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-accent rounded-lg mb-1">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
          {(user || admin) ? (
            <button
              onClick={logout}
              className="w-full mt-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="w-full mt-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-4 py-2 rounded-lg text-sm font-medium text-center"
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