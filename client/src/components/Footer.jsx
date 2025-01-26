import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-dark-bg text-[#1e1e1e] dark:text-dark-text py-4 mt-8">
      <div className="container mx-auto text-center">
        <div className="flex justify-center space-x-6">
          <Link to="/termini" className="hover:text-gray-400 dark:hover:text-gray-300">Termini e Condizioni</Link>
          <Link to="/privacy" className="hover:text-gray-400 dark:hover:text-gray-300">Privacy Policy</Link>
          <Link to="/cookie" className="hover:text-gray-400 dark:hover:text-gray-300">Politica sui Cookies</Link>
        </div>
        <div className="mt-4">
          <p>&copy; {new Date().getFullYear()} Il tuo sito. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;