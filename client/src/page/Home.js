import React from 'react';
import { Globe, Monitor, Building2, BarChart3 } from 'lucide-react';
import flogo from "../assets/images/flogo.png"
import flogowhite from "../assets/images/flogowhite.png"
import mapbase from "../assets/images/mapbase.png"
import dashboard3d from "../assets/images/dashboard3d.png"

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="mx-auto px-4 py-4 flex justify-between items-center">
        <nav className="flex space-x-6">
          <a href="#" className="text-gray-600">Home</a>
          <a href="#" className="text-gray-600">About Us</a>
          <a href="#" className="text-gray-600">Contact</a>
        </nav>
        <img src={flogo} className='h-8' />
        <div className="flex space-x-4">
          <button className="px-4 py-2 text-gray-600 rounded-full border">Log In</button>
          <button className="px-4 py-2 bg-black text-white rounded-full">Sign up</button>
        </div>
      </header>
      <div class="border-t border-gray-300"></div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-6">Leading Affiliate Network<br />in the iGaming industry</h1>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          Fast Affiliation is a network for gambling, online poker, and sports betting, offering tools and support to maximize your engagement and earnings.
        </p>
        <div className="max-w-4xl mx-auto">
          <img 
            src={dashboard3d}
            alt="Dashboard Preview"
            className="w-full"
          />
        </div>
      </section>

      {/* Partners Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold text-center mb-12">our partners</h2>
        <div className="flex justify-center space-x-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-32 h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold text-center mb-12">why choose us</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Monitor className="w-8 h-8 items-center text-teal-600" />}
            title="Tailored Services"
            features={[
              "Personalized Affiliate Manager",
              "Arrangement of exclusive deals",
              "Built-in Messenger for direct communication with our Support Team"
            ]}
          />
          <FeatureCard
            icon={<Building2 className="w-8 h-8 items-center text-teal-600" />}
            title="Commission Payments"
            features={[
              "Monthly payment sessions each month",
              "Choose from 5 payment methods, including Bitcoin",
              "Adjustable payout according to your preferences"
            ]}
          />
          <FeatureCard
            icon={<Globe className="w-8 h-8 text-teal-600" />}
            title="Campaign Portfolio"
            features={[
              "Collaborations with leading operators",
              "Diverse verticals: Sportsbook, Casino, Poker",
              "Flexible deal options: CPA, Revenue Share, Hybrid"
            ]}
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8 text-teal-600" />}
            title="Affiliate Rewards"
            features={[
              "Loyalty Program: Unlock extra rewards through our VIP system",
              "Referral Program: Receive 5% commission on referrals"
            ]}
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-center space-x-16">
          <StatCard number="50+" label="Campaigns" />
          <StatCard number="120+" label="Affiliates" />
          <StatCard number="20+" label="Brands" />
        </div>
      </section>

      {/* Global Map Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl mb-8">provides global affiliate support with swift solutions for all gaming sectors.</p>
        <div className="max-w-4xl mx-auto">
          <img 
            src= {mapbase}
            alt="Global Map"
            className="w-full"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Ready to begin?</h2>
        <p className="mb-8">Sign up today or reach out for more details!</p>
        <div className="flex justify-center space-x-4">
          <button className="px-6 py-3 bg-black text-white rounded-full">Sign up</button>
          <button className="px-6 py-3 border border-gray-300 rounded-full">Contact us</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-teal-800 text-white py-12">
        <div className="mx-auto px-4">
          <div className="text-center">
            <div className="flex justify-center">
             <img src={flogowhite} alt="Fast Affiliation" className="h-8" />
             <span className="font-bold text-center text-white mb-6 mt-4">Fast Affiliation</span>
            </div>
            <nav className="flex justify-center space-x-6 mb-8">
              <a href="#" className="text-white">Home</a>
              <a href="#" className="text-white">About</a>
              <a href="#" className="text-white">Service</a>
              <a href="#" className="text-white">Contact Us</a>
            </nav>
            <div className="flex justify-center space-x-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 bg-teal-700 rounded-full"></div>
              ))}
            </div>
            <div className="text-sm">Copyright Fast Affiliation</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, features }) => (
  <div className="p-6 bg-gray-50 rounded-lg">
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="text-sm text-gray-600">{feature}</li>
      ))}
    </ul>
  </div>
);

const StatCard = ({ number, label }) => (
  <div className="text-center">
    <div className="text-4xl font-bold mb-2">{number}</div>
    <div className="text-gray-600">{label}</div>
  </div>
);

export default LandingPage;