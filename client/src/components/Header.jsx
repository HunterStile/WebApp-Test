import { Link } from 'react-router-dom';
import flogo from "../assets/images/flogo.png";
import { useState } from "react";
import { Menu } from "lucide-react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full py-4 flex justify-between items-center border-b border-gray-300 px-6 md:px-12 relative">
      {/* Menu per mobile */}
      <button 
        className="md:hidden text-gray-600" 
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Menu size={28} />
      </button>

      {/* Nav Desktop */}
      <nav className="hidden md:flex space-x-8">
        <a href="/" className="text-gray-600">Home</a>
        <a href="/faq" className="text-gray-600">FAQ</a>
        <a href="/contact" className="text-gray-600">Contact</a>
      </nav>

      {/* Logo Centrale */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <img src={flogo} className="h-8" alt="Logo" />
      </div>

      {/* Login/Signup Desktop */}
      <div className="hidden md:flex space-x-4">
        <Link to="/login" className="px-4 py-2 text-gray-600 rounded-full border">Log In</Link>
        <Link to="/signup" className="px-4 py-2 bg-black text-white rounded-full">Sign up</Link>
      </div>

      {/* Menu Mobile (Dropdown) */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-center py-4 space-y-4 md:hidden">
          <a href="/" className="text-gray-600">Home</a>
          <a href="/faq" className="text-gray-600">FAQ</a>
          <a href="/contact" className="text-gray-600">Contact</a>
          <Link to="/login" className="px-4 py-2 text-gray-600 rounded-full border">Log In</Link>
          <Link to="/signup" className="px-4 py-2 bg-black text-white rounded-full">Sign up</Link>
        </div>
      )}
    </header>
  );
};

export default Header;
