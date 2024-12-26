import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { Link } from 'react-router-dom';

function Home() {
  const { user } = useContext(AuthContext);
  const { admin } = useContext(AdminAuthContext);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      {/* Header */}
      <header className="bg-blue-800 text-white p-8 shadow-md">
        <h1 className="text-4xl font-bold text-center">Welcome to MyApp!</h1>
        <p className="text-center text-lg mt-2">
          Your one-stop solution for managing campaigns, conversions, and more.
        </p>
      </header>

      {/* Main content */}
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1: General Overview */}
            <div className="bg-blue-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold mb-4">Overview</h3>
              <p className="text-blue-200 mb-4">
                Get a quick overview of your account, including your active campaigns, conversions, and performance metrics.
              </p>
              <Link
                to="/dashboard"
                className="text-orange-400 hover:text-orange-500 font-medium"
              >
                Go to Dashboard
              </Link>
            </div>

            {/* Card 2: Campaign List - Only visible for normal users */}
            {user && !admin && (
              <div className="bg-blue-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-2xl font-semibold mb-4">Campaigns</h3>
                <p className="text-blue-200 mb-4">
                  Explore and manage your ongoing campaigns, track performance, and optimize your results.
                </p>
                <Link
                  to="/campaignlist"
                  className="text-orange-400 hover:text-orange-500 font-medium"
                >
                  View Campaigns
                </Link>
              </div>
            )}

            {/* Card 3: Admin Area - Only visible for admins */}
            {admin && (
              <div className="bg-blue-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-2xl font-semibold mb-4">Admin Dashboard</h3>
                <p className="text-blue-200 mb-4">
                  Manage users, campaigns, and perform administrative tasks.
                </p>
                <Link
                  to="/admin"
                  className="text-orange-400 hover:text-orange-500 font-medium"
                >
                  Go to Admin Dashboard
                </Link>
              </div>
            )}

            {/* Card 4: More Features */}
            <div className="bg-blue-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold mb-4">More Features</h3>
              <p className="text-blue-200 mb-4">
                Discover more about affiliations, events, and your store with us.
              </p>
              <Link
                to="/more"
                className="text-orange-400 hover:text-orange-500 font-medium"
              >
                Explore More
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;