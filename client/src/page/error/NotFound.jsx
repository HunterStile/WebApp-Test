import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Search,
  AlertCircle,
  MoveLeft
} from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 animate-fade-in
      bg-white dark:bg-dark-bg">
      <div className="max-w-2xl w-full space-y-8 text-center">
        {/* Icona e Titolo */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <AlertCircle 
              size={64} 
              className="text-dark-green dark:text-light-green"
            />
          </div>
          <h1 className="text-6xl font-bold 
            text-custom-black dark:text-dark-text">
            404
          </h1>
          <h2 className="text-2xl font-medium
            text-dark-blue dark:text-dark-text">
            Pagina non trovata
          </h2>
        </div>

        {/* Messaggio */}
        <p className="text-lg 
          text-custom-black dark:text-dark-text">
          La pagina che stai cercando potrebbe essere stata spostata, eliminata o potrebbe non essere mai esistita.
        </p>

        {/* Pulsanti */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          {/* Pulsante Home */}
          <Link 
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
              bg-dark-green dark:bg-dark-accent 
              text-white dark:text-dark-text
              hover:bg-light-green hover:text-dark-green dark:hover:bg-dark-card
              transition-colors duration-200">
            <Home size={20} />
            <span>Torna alla Home</span>
          </Link>

          {/* Pulsante Indietro */}
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
              border border-dark-green dark:border-dark-accent
              text-custom-black dark:text-dark-text
              hover:bg-light-green dark:hover:bg-dark-card
              transition-colors duration-200">
            <MoveLeft size={20} />
            <span>Pagina precedente</span>
          </button>
        </div>

        {/* Suggerimento di ricerca */}
        <div className="pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg
            bg-light-green dark:bg-dark-card">
            <Search size={20} className="text-dark-green dark:text-dark-text" />
            <span className="text-dark-green dark:text-dark-text">
              Prova a utilizzare la ricerca per trovare ciò che stai cercando
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;