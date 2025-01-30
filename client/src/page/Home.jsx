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
      const scrollAmount = clientWidth / 2;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };
  
  const StatCard = ({ number, label }) => (
    <div className="text-center">
      <div className="text-4xl font-bold mb-2">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
  
  const FeatureCard = ({ icon, title, features }) => (
    <div className="p-6 bg-gray-50 rounded-lg text-center">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ul className="space-y-2 text-sm text-gray-600 ">
        {features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-white flex flex-col items-center text-center px-0">
      <header className="w-full py-4 flex justify-between items-center border-b border-gray-300 px-12">
        <nav className="flex space-x-8">
          <a href="#" className="text-gray-600">Home</a>
          <a href="#" className="text-gray-600">About Us</a>
          <a href="#" className="text-gray-600">Contact</a>
        </nav>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <img src={flogo} className="h-8" alt="Logo" />
        </div>
        <div className="flex space-x-4">
          <Link to="/login" className="px-4 py-2 text-gray-600 rounded-full border">Log In</Link>
          <Link to="/signup" className="px-4 py-2 bg-black text-white rounded-full">Sign up</Link>
        </div>
      </header>
  
      <section className="py-16">
        <h1 className="text-5xl font-bold mb-6 space-y-1">Leading Affiliate Network<br />in the iGaming industry</h1>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          Fast Affiliation is a network for gambling, online poker, and sports betting, offering tools and support to maximize your engagement and earnings.
        </p>
        <img src={dashboard3d} alt="Dashboard Preview" className="w-full max-w-4xl ml-16" />
      </section>
  
      <section className="py-16 w-full">
        <h2 className="text-2xl font-semibold mb-12">Our Partners</h2>
        <div className="relative w-full flex items-center justify-center">
          <button className="p-2 bg-gray-800 text-white rounded-full shadow-md" onClick={() => scroll('left')}>
            &#9664;
          </button>
          <div ref={scrollRef} className="flex overflow-x-hidden gap-12 scroll-smooth">
            {partners.map((campaignName, index) => (
              <div key={index} className="w-48 h-20 flex-shrink-0">
                <CampaignLogo campaignName={campaignName} />
              </div>
            ))}
          </div>
          <button className="p-2 bg-gray-800 text-white rounded-full shadow-md" onClick={() => scroll('right')}>
            &#9654;
          </button>
        </div>
      </section>
  
      <section className="py-16 text-center">
      <h2 class="text-2xl font-semibold mb-10">Why choose us</h2>
      <section className="py-16 w-full grid grid-cols-1 md:grid-cols-4 gap-8">
        <FeatureCard icon={<Monitor className="w-8 h-8 text-teal-600" />} title="Tailored Services" features={["Personalized Affiliate Manager", "Arrangement of exclusive deals", "Built-in Messenger for direct communication with our Support Team"]} />
        <FeatureCard icon={<Building2 className="w-8 h-8 text-teal-600" />} title="Commission Payments" features={["Two monthly payment sessions each month", "Choose payment methods, including Bitcoin", "Adjustable payout according to your preferences"]} />
        <FeatureCard icon={<Globe className="w-8 h-8 text-teal-600" />} title="Campaign Portfolio" features={["Collaborations with leading operators", "Diverse verticals: Sportsbook, Casino, Poker", "Flexible deal options: CPA, Revenue Share, Hybrid"]} />
        <FeatureCard icon={<BarChart3 className="w-8 h-8 text-teal-600" />} title="Affiliate Rewards" features={["Loyalty Program", "Referral Bonuses"]} />
      </section>
      </section>

      <section className="py-16 flex justify-center space-x-16">
        <StatCard number="50+" label="Campaigns" />
        <StatCard number="120+" label="Affiliates" />
        <StatCard number="20+" label="Brands" />
      </section>
  
      <section className="py-16 text-center">
        <p className="text-xl mb-8">Providing global affiliate support with swift solutions for all gaming sectors.</p>
        <img src={mapbase} alt="Global Map" className="w-full max-w-4xl mx-auto" />
      </section>
  
      <section className="py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Ready to begin?</h2>
        <p className="mb-8">Sign up today or reach out for more details!</p>
        <div className="flex justify-center space-x-4">
          <button className="px-6 py-3 bg-black text-white rounded-full">Sign up</button>
          <button className="px-6 py-3 border border-gray-300 rounded-full">Contact us</button>
        </div>
      </section>
  
      <footer className="bg-teal-800 text-white py-12 w-full text-center">
        <div className="mb-6 flex justify-center items-center">
          <img src={flogowhite} alt="Fast Affiliation" className="h-8" />
          <span className="ml-4 font-bold">Fast Affiliation</span>
        </div>
        <nav className="flex justify-center space-x-6 mb-6">
          <a href="#" className="text-white">Home</a>
          <a href="#" className="text-white">About</a>
          <a href="#" className="text-white">Service</a>
          <a href="#" className="text-white">Contact Us</a>
        </nav>
                <div className="flex justify-center space-x-6">
                  <Link to="/termini" className="hover:text-gray-400 dark:hover:text-gray-300">Termini e Condizioni</Link>
                  <Link to="/privacy" className="hover:text-gray-400 dark:hover:text-gray-300">Privacy Policy</Link>
                  <Link to="/cookie" className="hover:text-gray-400 dark:hover:text-gray-300">Politica sui Cookies</Link>
                </div>
      </footer>
    </div>
  )
  
  
}
  export default LandingPage;
