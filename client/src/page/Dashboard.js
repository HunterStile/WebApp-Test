import React, { useContext, useMemo } from 'react';
import { ConversionContext } from '../context/ConversionContext';

const Dashboard = () => {
  const { conversions, loading, error } = useContext(ConversionContext);

  // Calcolo del totale delle commissioni
  const totalCommission = useMemo(() => {
    return conversions.reduce((sum, conversion) => {
      return sum + (parseFloat(conversion.commission) || 0); // Somma solo valori validi
    }, 0).toFixed(2); // Formatta con due decimali
  }, [conversions]);

  if (loading) {
    return <div>Caricamento delle conversioni...</div>;
  }

  if (error) {
    return <div>Errore: {error}</div>;
  }

  return (
    <div className="dashboard p-4 bg-gray-800 text-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Dashboard Cliente</h1>
      <div className="stat bg-gray-700 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold">Totale Commissioni Maturate</h2>
        <p className="text-3xl font-bold text-green-400">€ {totalCommission}</p>
      </div>
      <div className="conversion-list bg-gray-700 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Dettaglio Conversioni</h2>
        {conversions.length > 0 ? (
          <ul className="space-y-2">
            {conversions.map((conv) => (
              <li key={conv.conversion_id} className="bg-gray-600 p-2 rounded">
                <p><strong>Campagna:</strong> {conv.campaign_name}</p>
                <p><strong>Data:</strong> {new Date(conv.date).toLocaleDateString()}</p>
                <p><strong>Commissione:</strong> € {parseFloat(conv.commission).toFixed(2)}</p>
                <p><strong>Stato:</strong> {conv.status}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nessuna conversione trovata.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
