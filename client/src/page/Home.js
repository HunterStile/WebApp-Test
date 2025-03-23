// client/src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Package, Store, Clipboard, ArrowRight } from 'lucide-react';

function Home() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="mx-auto h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center mb-6">
          <Leaf size={40} className="text-primary-600" />
        </div>
        <h1 className="text-4xl font-extrabold text-tertiary-900 sm:text-5xl md:text-6xl">
          <span className="block">Sistema di Gestione</span>
          <span className="block text-primary-600">HACCP</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-tertiary-500">
          Gestisci la tracciabilità e il controllo dei prodotti in modo semplice ed efficiente
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link to="/external-batches" className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition duration-300 flex items-center">
            Inizia Ora
            <ArrowRight size={18} className="ml-2" />
          </Link>
          <Link to="/dashboard" className="px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 transition duration-300">
            Dashboard
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-tertiary-900 text-center mb-12">
          Funzionalità principali
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-card hover:shadow-lg transition duration-300">
            <div className="h-12 w-12 rounded-md bg-primary-100 flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-medium text-tertiary-900 mb-2">Gestione Lotti Esterni</h3>
            <p className="text-tertiary-600">
              Registra e monitora tutti i lotti di prodotti in entrata con informazioni dettagliate e tracciabilità completa.
            </p>
            <Link to="/external-batches" className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-800">
              Visualizza <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-card hover:shadow-lg transition duration-300">
            <div className="h-12 w-12 rounded-md bg-primary-100 flex items-center justify-center mb-4">
              <Store className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-medium text-tertiary-900 mb-2">Anagrafica Fornitori</h3>
            <p className="text-tertiary-600">
              Gestisci l'archivio completo dei tuoi fornitori con tutti i dati necessari alla tracciabilità.
            </p>
            <Link to="/suppliers" className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-800">
              Visualizza <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-card hover:shadow-lg transition duration-300">
            <div className="h-12 w-12 rounded-md bg-primary-100 flex items-center justify-center mb-4">
              <Clipboard className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-medium text-tertiary-900 mb-2">Controllo HACCP</h3>
            <p className="text-tertiary-600">
              Monitora i punti critici di controllo e documenta tutte le verifiche per garantire la sicurezza alimentare.
            </p>
            <Link to="/dashboard" className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-800">
              Visualizza <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="mt-24 bg-primary-50 rounded-xl p-8 md:p-12">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-tertiary-900">Pronto per iniziare?</h2>
            <p className="mt-2 text-lg text-tertiary-600">
              Accedi al sistema e inizia a gestire la tracciabilità dei tuoi prodotti
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <Link to="/login2" className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition duration-300">
              Accedi al sistema
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
