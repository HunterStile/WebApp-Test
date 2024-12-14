import React, { useState, useEffect,useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ConversionList = () => {
  const { user } = useContext(AuthContext); // Ottieni l'username dal contesto
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Funzione per recuperare le conversioni dal database
  const fetchConversionsFromDB = async () => {
    try {
      setLoading(true);
      // Passa l'username come parametro
      const response = await axios.get('http://localhost:5000/api/gambling/conversions', {
        params: { aff_var: user }, // Include l'username come aff_var
      });
      
      // Assicurati di accedere alla proprietà corretta
      const conversionData = response.data.conversions || [];
      
      // Ordina le conversioni per data (più recenti prima)
      const sortedConversions = conversionData.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );

      setConversions(sortedConversions);
      setLoading(false);
    } catch (error) {
      console.error('Errore nel recupero conversioni:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Funzione per aggiornare le conversioni dall'API esterna
  const updateConversions = async () => {
    try {
      setUpdating(true);
      const response = await axios.get('http://localhost:5000/api/gambling/fetch-conversions');
      
      await fetchConversionsFromDB();
      
      alert(`Aggiornamento completato. Nuove conversioni: ${response.data.count}`);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        // Gestione specifica del rate limit
        alert(`Limite di richieste raggiunto. Riprova dopo: ${error.response.data.retryAfter}`);
      } else {
        console.error('Errore durante l\'aggiornamento:', error);
        alert('Errore durante l\'aggiornamento');
      }
    } finally {
      setUpdating(false);
    }
  };

  // Carica le conversioni all'inizializzazione del componente
  useEffect(() => {
    if (user) {
      fetchConversionsFromDB();
    }
  }, [user]);

  if (loading) return <div>Caricamento conversioni...</div>;
  if (error) return <div>Errore: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Conversioni Affiliate</h1>
        <button 
          onClick={updateConversions} 
          disabled={updating}
          className={`
            px-4 py-2 rounded 
            ${updating 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
          `}
        >
          {updating ? 'Aggiornamento...' : 'Aggiorna Conversioni'}
        </button>
      </div>

      {conversions.length === 0 ? (
        <div className="text-center text-gray-500">Nessuna conversione trovata</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">ID Conversione</th>
                <th className="p-2 border">Nome Campagna</th>
                <th className="p-2 border">Data</th>
                <th className="p-2 border">Tipo</th>
                <th className="p-2 border">Stato</th>
                <th className="p-2 border">Commissione</th>
                <th className="p-2 border">Sito</th>
              </tr>
            </thead>
            <tbody>
              {conversions.map(conv => (
                <tr 
                  key={conv.conversion_id || conv._id} 
                  className="hover:bg-gray-50"
                >
                  <td className="p-2 border">{conv.conversion_id}</td>
                  <td className="p-2 border">{conv.campaign_name}</td>
                  <td className="p-2 border">
                    {new Date(conv.date).toLocaleDateString('it-IT', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="p-2 border">{conv.type}</td>
                  <td className="p-2 border">
                    <span 
                      className={`
                        px-2 py-1 rounded text-xs
                        ${conv.status === 'validated' 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-yellow-200 text-yellow-800'
                        }
                      `}
                    >
                      {conv.status}
                    </span>
                  </td>
                  <td className="p-2 border">{conv.commission}</td>
                  <td className="p-2 border">{conv.site_url}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConversionList;