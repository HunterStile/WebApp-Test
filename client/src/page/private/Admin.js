import React, { useContext, useEffect } from 'react';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, LogOut, Settings, Activity, LayoutDashboard } from 'lucide-react';

const AdminDashboard = () => {
  const { admin, logout } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
    }
  }, [admin, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Navigation Bar */}
      <nav className="bg-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <ShieldAlert className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold text-white">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-white font-medium">Admin: {admin}</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome, Administrator {admin}
          </h2>
          <p className="mt-2 text-gray-600">
            Here you can manage users, monitor system activity, and configure settings.
          </p>
        </div>

        {/* Admin Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">1,234</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-semibold text-gray-900">42</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center">
              <LayoutDashboard className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className="text-2xl font-semibold text-gray-900">Healthy</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Settings</p>
                <p className="text-2xl font-semibold text-gray-900">23</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                Manage Users
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                View System Logs
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                Configure Settings
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <Activity className="h-4 w-4 mr-2" />
                <span>New user registration - 5 minutes ago</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Activity className="h-4 w-4 mr-2" />
                <span>System backup completed - 1 hour ago</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Activity className="h-4 w-4 mr-2" />
                <span>Settings updated - 2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;