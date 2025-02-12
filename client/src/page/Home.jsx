import React, { useRef } from 'react';
import { Globe, Monitor, Building2, BarChart3 } from 'lucide-react';
import flogo from "../assets/images/flogo.png";
import flogowhite from "../assets/images/flogowhite.png";
import mapbase from "../assets/images/mapbase.png";
import dashboard3d from "../assets/images/dashboard3d.png";
import CampaignLogo from '../components/utils/CampaignLogo';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import dashboard2 from "../assets/images/dashboard2.png";
import mapbase2 from "../assets/images/mapbase2.png";

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
      <div className="text-5xl font-bold mb-2">{number}</div>
      <div className="text-gray-600 text-lg">{label}</div>
    </div>
  );
  
  const FeatureCard = ({ icon, title, features }) => (
    <div className=" w-[340px] h-[400px] p-6 bg-gray-50 rounded-lg text-center shadow-lg">
      <div className="mb-4 flex justify-center mt-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <ul className="space-y-2 text-base text-gray-600 ">
        {features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-white flex flex-col items-center text-center px-0 text-custom-black">
      <Header />
  
      <section className="py-14">
        <h1 className="text-6xl font-bold mb-1">Leading Affiliate Network</h1>
        <h2 className="text-6xl font-bold mb-6">in the iGaming industry</h2>
        <p className="text-gray-600 mb-12 max-w-3xl mx-auto">
          Fast Affiliation is a network for gambling, online poker, and sports betting, offering tools and support to maximize your engagement and earnings.
        </p>
        <img src={dashboard2} alt="Dashboard Preview" className="w-full max-w-5xl items-center ml-24" />
      </section>
  
      <section className="py-10 pb-10 w-full">
  <h2 className="text-3xl font-semibold mb-12">Our Partners</h2>
  <div className="relative w-full flex items-center justify-center group">
    <span 
      className=" p-2 absolute left-0 text-3xl text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
      onClick={() => scroll('left')}
    >
      &lt;
    </span>
    <div ref={scrollRef} className="flex overflow-x-hidden gap-12 scroll-smooth">
      {partners.map((campaignName, index) => (
        <div key={index} className="w-48 h-20 flex-shrink-0">
          <CampaignLogo campaignName={campaignName} />
        </div>
      ))}
    </div>
    <span 
      className="p-2 absolute right-0 text-3xl text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
      onClick={() => scroll('right')}
    >
      &gt;
    </span>
  </div>
</section>

  
      <section className="px-16 py-10 text-center">
      <h2 class="text-3xl font-semibold mb-6">Why choose us</h2>
      <section className="py-10 w-full grid grid-cols-1 md:grid-cols-4 gap-14">
        <FeatureCard icon={<Monitor className="w-14 h-14 text-teal-600" />} title="Tailored Services" features={["Personalized Affiliate Manager", "Arrangement of exclusive deals", "Built-in Messenger for direct communication with our Support Team"]} />
        <FeatureCard icon={<Building2 className="w-14 h-14 text-teal-600" />} title="Commission Payments" features={["Two monthly payment sessions each month", "Choose payment methods, including Bitcoin", "Adjustable payout according to your preferences"]} />
        <FeatureCard icon={<Globe className="w-14 h-14 text-teal-600" />} title="Campaign Portfolio" features={["Collaborations with leading operators", "Diverse verticals: Sportsbook, Casino, Poker", "Flexible deal options: CPA, Revenue Share, Hybrid"]} />
        <FeatureCard icon={<BarChart3 className="w-14 h-14 text-teal-600" />} title="Affiliate Rewards" features={["Loyalty Program: Unlock exclusive rewards through our VIP room.", "Referral Program: Receive 5% commission on referrals' earnings."]} />
      </section>
      </section>

      <section className="py-10 flex justify-center space-x-56">
        <StatCard number="50+" label="Campaigns" />
        <StatCard number="120+" label="Affiliates" />
        <StatCard number="20+" label="Brands" />
      </section>
  
      <section className="py-16 text-center">
        <p className="text-4xl mb-10">Providing global affiliate support with swift solutions for all gaming sectors.</p>
        <img src={mapbase2} alt="Global Map" className="w-full max-w-6xl mx-auto items-center" />
      </section>
  
      <section className="py-16 text-center">
        <h2 className="text-4xl font-semibold mb-4">Ready to begin?</h2>
        <p className="mb-8 text-3xl">Sign up today or reach out for more details!</p>
        <div className="flex justify-center space-x-4">
        <Link to="/signup" className="px-7 py-4 bg-black text-white rounded-full">Sign up</Link>
        <Link to="/contact" className="px-7 py-4 border border-gray-300 rounded-full">Contact us</Link>
        </div>
      </section>
  
      <footer className="bg-teal-800 text-white py-12 w-full text-center">
        <div className="mb-6 flex justify-center items-center">
          <img src={flogowhite} alt="Fast Affiliation" className="h-8" />
          <span className="ml-4 font-bold">Fast Affiliation</span>
        </div>
        <nav className="flex justify-center space-x-6 mb-6">
          <a href="/" className="text-white">Home</a>
          <a href="/faq" className="text-white">FAQ</a>
          <a href="#" className="text-white">Service</a>
          <a href="/contact" className="text-white">Contact Us</a>
        </nav>
                <div className="flex justify-center space-x-6">
                  <Link to="/termini" className="hover:text-gray-400 dark:hover:text-gray-300">Terms and Conditions</Link>
                  <Link to="/privacy" className="hover:text-gray-400 dark:hover:text-gray-300">Privacy Policy</Link>
                  <Link to="/cookie" className="hover:text-gray-400 dark:hover:text-gray-300">Cookies Policy</Link>
                </div>
                <div className="mt-4">
          <p>&copy; {new Date().getFullYear()} Fast Affiliation. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
  
  
}
  export default LandingPage;
