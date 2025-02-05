import { Link } from 'react-router-dom';
import flogo from "../assets/images/flogo.png";

const Header = () => {
  return (
    <header className="w-full py-4 flex justify-between items-center border-b border-gray-300 px-12">
      <nav className="flex space-x-8">
        <a href="/" className="text-gray-600">Home</a>
        <a href="#" className="text-gray-600">About Us</a>
        <a href="/contact" className="text-gray-600">Contact</a>
      </nav>
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <img src={flogo} className="h-8" alt="Logo" />
      </div>
      <div className="flex space-x-4">
        <Link to="/login" className="px-4 py-2 text-gray-600 rounded-full border">Log In</Link>
        <Link to="/signup" className="px-4 py-2 bg-black text-white rounded-full">Sign up</Link>
      </div>
    </header>
  );
};

export default Header;
