import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ServerCrash,
  Home, 
  MoveLeft,
  RefreshCw
} from 'lucide-react';

const ServerError = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 animate-fade-in
      bg-light-surface dark:bg-dark-surface">
      <div className="max-w-2xl w-full space-y-8 text-center">
        {/* Icona e Titolo */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <ServerCrash 
              size={64} 
              className="text-light-error dark:text-dark-error"
            />
          </div>
          <h1 className="text-6xl font-bold 
            text-light-on-surface dark:text-dark-on-surface">
            500
          </h1>
          <h2 className="text-2xl font-medium
            text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Errore del server
          </h2>
        </div>

        {/* Messaggio */}
        <p className="text-lg 
          text-light-on-surface-variant dark:text-dark-on-surface-variant">
          Si è verificato un errore imprevisto sul server. Il nostro team tecnico è stato notificato e sta lavorando per risolvere il problema.
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

          {/* Pulsante Riprova */}
          <button 
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
              bg-light-secondary dark:bg-dark-secondary
              text-light-on-secondary dark:text-dark-on-secondary
              hover:bg-light-secondary-container dark:hover:bg-dark-secondary-container
              transition-colors duration-200">
            <RefreshCw size={20} />
            <span>Riprova</span>
          </button>

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
            bg-light-error/10 dark:bg-dark-error/10
            text-light-error dark:text-dark-error">
            <span>
              Se il problema persiste, contatta il supporto tecnico
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerError;