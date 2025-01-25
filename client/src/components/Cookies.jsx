// src/components/Cookies.js
import React from 'react';

const Cookies = () => {
  return (
    <div className="p-8 bg-white text-gray-900">
      <h1 className="text-3xl font-bold mb-4">Politica sui Cookies</h1>
      <p>Utilizziamo i cookies per migliorare l'esperienza dell'utente sul nostro sito. I cookies sono piccoli file di testo che vengono salvati sul tuo dispositivo quando visiti il nostro sito...</p>
      <h2 className="text-2xl font-semibold mt-6">1. Tipi di Cookies Utilizzati</h2>
      <p>
        Cookies Necessari: Essenziali per il funzionamento del sito. 
        Cookies Analitici: Utilizzati per raccogliere informazioni su come gli utenti interagiscono con il nostro sito...
      </p>
      {/* Aggiungi il resto della Politica sui Cookies */}
    </div>
  );
};

export default Cookies;
