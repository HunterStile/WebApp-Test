import React, { useRef } from 'react';
import { Globe, Monitor, Building2, BarChart3 } from 'lucide-react';
import flogo from "../assets/images/flogo.png";
import flogowhite from "../assets/images/flogowhite.png";
import mapbase from "../assets/images/mapbase.png";
import dashboard3d from "../assets/images/dashboard3d.png";
import CampaignLogo from '../components/utils/CampaignLogo';
import { Link } from 'react-router-dom';

const partners = [
  'BETANO - Exclusive',
  'RABONA - Bonus Deal',
  'TIKTAKBET - Best Offer',
  'CAZEURS - Special Promo',
  'BETANO - Exclusive',
  'BETANO - Exclusive',
  'BETANO - Exclusive',
  'BETANO - Exclusive',
  'YBETS - Special Promo',
  'CASINOTOGHETER - Special Promo',
];

const LandingPage = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth / 2; // Scroll di metà larghezza
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center text-center">
      {/* Header */}
      <header className="w-full px-4 py-4 flex justify-between items-center">
        <nav className="flex space-x-6">
          <a href="#" className="text-gray-600">Home</a>
          <a href="#" className="text-gray-600">About Us</a>
          <a href="#" className="text-gray-600">Contact</a>
        </nav>
        <img src={flogo} className="h-8" alt="Logo" />
        <div className="flex space-x-4">
          <button className="px-4 py-2 text-gray-600 rounded-full border">Log In</button>
          <button className="px-4 py-2 bg-black text-white rounded-full">Sign up</button>
        </div>
      </header>

      <div className="w-full border-t border-gray-300"></div>

      {/* Hero Section */}
      <section className="px-4 py-16">
        <h1 className="text-5xl font-bold mb-6">Leading Affiliate Network<br />in the iGaming industry</h1>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          Fast Affiliation is a network for gambling, online poker, and sports betting, offering tools and support to maximize your engagement and earnings.
        </p>
        <div className="w-full max-w-4xl mx-auto">
          <img src={dashboard3d} alt="Dashboard Preview" className="w-full" />
        </div>
      </section>

      {/* Partners Section */}
      <section className="px-4 py-16">
        <h2 className="text-2xl font-semibold mb-12">Our Partners</h2>
        <div className="relative group w-full">
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-gray-800 text-white rounded-full shadow-md hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={() => scroll('left')}
          >
            &#9664;
          </button>
          <div
            ref={scrollRef}
            className="flex overflow-x-hidden gap-12 scroll-smooth"
          >
            {partners.map((campaignName, index) => (
              <div key={index} className="w-48 h-20 flex-shrink-0">
                <CampaignLogo campaignName={campaignName} />
              </div>
            ))}
          </div>
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-gray-800 text-white rounded-full shadow-md hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={() => scroll('right')}
          >
            &#9654;
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16">
        <h2 className="text-2xl font-semibold mb-12">Why choose us</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Monitor className="w-8 h-8 items-center text-teal-600" />}
            title="Tailored Services"
            features={[
              "Personalized Affiliate Manager",
              "Arrangement of exclusive deals",
              "Built-in Messenger for direct communication with our Support Team",
            ]}
          />
          <FeatureCard
            icon={<Building2 className="w-8 h-8 items-center text-teal-600" />}
            title="Commission Payments"
            features={[
              "Monthly payment sessions each month",
              "Choose from 5 payment methods, including Bitcoin",
              "Adjustable payout according to your preferences",
            ]}
          />
          <FeatureCard
            icon={<Globe className="w-8 h-8 text-teal-600" />}
            title="Campaign Portfolio"
            features={[
              "Collaborations with leading operators",
              "Diverse verticals: Sportsbook, Casino, Poker",
              "Flexible deal options: CPA, Revenue Share, Hybrid",
            ]}
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8 text-teal-600" />}
            title="Affiliate Rewards"
            features={[
              "Loyalty Program: Unlock extra rewards through our VIP system",
              "Referral Program: Receive 5% commission on referrals",
            ]}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-teal-800 text-white py-12 w-full">
        <div>
          <div className="flex justify-center items-center mb-6">
            <img src={flogowhite} alt="Fast Affiliation" className="h-8" />
            <span className="ml-4 font-bold">Fast Affiliation</span>
          </div>
          <nav className="flex justify-center space-x-6 mb-8">
            <a href="#" className="text-white">Home</a>
            <a href="#" className="text-white">About</a>
            <a href="#" className="text-white">Service</a>
            <a href="#" className="text-white">Contact Us</a>
          </nav>
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

export default LandingPage;
