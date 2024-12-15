import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { Link } from 'react-router-dom';

function Home() {
  const { user } = useContext(AuthContext);
  const { admin } = useContext(AdminAuthContext);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-500 text-white p-6">
        <h1 className="text-3xl font-bold text-center">Welcome to MyApp!</h1>
        <p className="text-center text-lg mt-2">Your one-stop solution for managing campaigns, conversions, and more.</p>
      </header>

      {/* Main content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1: General Overview */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Overview</h3>
              <p className="text-gray-700 mb-4">Get a quick overview of your account, including your active campaigns, conversions, and performance metrics.</p>
              <Link to="/dashboard" className="text-blue-500 hover:text-orange-600">Go to Dashboard</Link>
            </div>

            {/* Card 2: Campaign List - Only visible for normal users */}
            {user && !admin && (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Campaigns</h3>
                <p className="text-gray-700 mb-4">Explore and manage your ongoing campaigns, track performance, and optimize your results.</p>
                <Link to="/campaignlist" className="text-blue-500 hover:text-orange-600">View Campaigns</Link>
              </div>
            )}

            {/* Card 3: Admin Area - Only visible for admins */}
            {admin && (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Admin Dashboard</h3>
                <p className="text-gray-700 mb-4">Manage users, campaigns, and perform administrative tasks.</p>
                <Link to="/admin" className="text-blue-500 hover:text-orange-600">Go to Admin Dashboard</Link>
              </div>
            )}

            {/* Card 4: More Features */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">More Features</h3>
              <p className="text-gray-700 mb-4">Discover more about affiliations, events, and your store with us.</p>
              <Link to="/more" className="text-blue-500 hover:text-orange-600">Explore More</Link>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}

export default Home;
