// ConversionList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConversionList = () => {
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversions = async () => {
      try {
        // Prima featchare dall'API esterna
        await axios.get('http://localhost:5000/fetch-conversions');
        
        // Poi recuperare da MongoDB
        const response = await axios.get('http://localhost:5000/conversions');
        setConversions(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Errore nel recupero conversioni:', error);
        setLoading(false);
      }
    };

    fetchConversions();
  }, []);

  if (loading) return <div>Caricamento conversioni...</div>;

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
            <tr key={conv.conversion_id}>
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