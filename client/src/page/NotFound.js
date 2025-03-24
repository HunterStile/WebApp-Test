import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <div className="text-center max-w-lg">
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-primary-50 rounded-full">
            <AlertTriangle size={64} className="text-primary-600" />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold text-primary-800 mb-3">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Pagina non trovata</h2>
        
        <p className="text-gray-600 text-lg mb-10">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        
        <div className="grid gap-4 md:grid-cols-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={18} />
            Torna indietro
          </button>
          
          <Link
            to="/"
            className="flex items-center justify-center gap-2 py-3 px-4 bg-primary-600 rounded-lg text-white font-medium hover:bg-primary-700 transition-colors shadow-md"
          >
            <Home size={18} />
            Vai alla home
          </Link>
        </div>
        
        <div className="mt-12 text-gray-500 text-sm">
          Se ritieni che si tratti di un errore, contatta l'assistenza.
        </div>
      </div>
    </div>
  );
};

export default NotFound; 