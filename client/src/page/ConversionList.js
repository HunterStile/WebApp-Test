import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConversionList = () => {
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversions = async () => {
      try {
        // Featchare dall'API esterna
        const fetchResponse = await axios.get('http://localhost:5000/api/gambling/fetch-conversions');
        console.log('Fetch Response:', fetchResponse.data);

        // Recuperare da MongoDB
        const response = await axios.get('http://localhost:5000/api/gambling/conversions');
        console.log('Full Conversion Response:', response.data);

        // Assicurati di accedere alla proprietà corretta
        const conversionData = response.data.conversions || response.data;
        
        // Debug: Verifica il tipo di dato
        console.log('Conversion Data Type:', typeof conversionData);
        console.log('Is Array:', Array.isArray(conversionData));

        // Se non è un array, prova a convertirlo
        const safeConversions = Array.isArray(conversionData) 
          ? conversionData 
          : Object.values(conversionData);

        setConversions(safeConversions);
        setLoading(false);
      } catch (error) {
        console.error('Errore dettagliato nel recupero conversioni:', error);
        console.error('Error Response:', error.response?.data);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchConversions();
  }, []);

  if (loading) return <div>Caricamento conversioni...</div>;
  if (error) return <div>Errore: {error}</div>;

  // Aggiungi un ulteriore controllo
  if (!conversions || conversions.length === 0) {
    return <div>Nessuna conversione trovata</div>;
  }

  return (
    <div>
      <h1>Conversioni Affiliate</h1>
      <table>
        <thead>
          <tr>
            <th>ID Conversione</th>
            <th>Nome Campagna</th>
            <th>Data</th>
            <th>Tipo</th>
            <th>Stato</th>
            <th>Commissione</th>
          </tr>
        </thead>
        <tbody>
          {conversions.map(conv => (
            <tr key={conv.conversion_id || conv._id}>
              <td>{conv.conversion_id}</td>
              <td>{conv.campaign_name}</td>
              <td>{new Date(conv.date).toLocaleDateString()}</td>
              <td>{conv.type}</td>
              <td>{conv.status}</td>
              <td>{conv.commission}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConversionList;