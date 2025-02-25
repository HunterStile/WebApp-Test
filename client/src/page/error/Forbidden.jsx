import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield,
  Home, 
  MoveLeft,
  LogIn
} from 'lucide-react';

const Forbidden = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 animate-fade-in
      bg-light-surface dark:bg-dark-surface">
      <div className="max-w-2xl w-full space-y-8 text-center">
        {/* Icona e Titolo */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <Shield 
              size={64} 
              className="text-light-error dark:text-dark-error"
            />
          </div>
          <h1 className="text-6xl font-bold 
            text-light-on-surface dark:text-dark-on-surface">
            403
          </h1>
          <h2 className="text-2xl font-medium
            text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Accesso non autorizzato
          </h2>
        </div>

        {/* Messaggio */}
        <p className="text-lg 
          text-light-on-surface-variant dark:text-dark-on-surface-variant">
          Non hai i permessi necessari per accedere a questa pagina. Se ritieni che questo sia un errore, contatta l'amministratore.
        </p>

        {/* Pulsanti */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          {/* Pulsante Home */}
          <Link 
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
              bg-light-primary dark:bg-dark-primary 
              text-light-on-primary dark:text-dark-on-primary
              hover:bg-light-primary-container dark:hover:bg-dark-primary-container
              transition-colors duration-200">
            <Home size={20} />
            <span>Torna alla Home</span>
          </Link>

          {/* Pulsante Login */}
          <Link 
            to="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
              bg-light-secondary dark:bg-dark-secondary
              text-light-on-secondary dark:text-dark-on-secondary
              hover:bg-light-secondary-container dark:hover:bg-dark-secondary-container
              transition-colors duration-200">
            <LogIn size={20} />
            <span>Accedi</span>
          </Link>

          {/* Pulsante Indietro */}
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
              border border-light-outline dark:border-dark-outline
              text-light-on-surface dark:text-dark-on-surface
              hover:bg-light-surface-bright dark:hover:bg-dark-surface-bright
              transition-colors duration-200">
            <MoveLeft size={20} />
            <span>Pagina precedente</span>
          </button>
        </div>

        {/* Info box */}
        <div className="pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg
            bg-light-surface-container dark:bg-dark-surface-container">
            <span className="text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Se hai già un account, assicurati di aver effettuato l'accesso con le credenziali corrette
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;