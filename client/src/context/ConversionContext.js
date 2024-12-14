// ConversionContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import API_BASE_URL from '../config';

export const ConversionContext = createContext();

export const ConversionProvider = ({ children }) => {
  const { user } = useContext(AuthContext); // Ottieni l'utente dal contesto Auth
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Funzione per recuperare le conversioni dal database
  const fetchConversions = async () => {
    if (!user) return; // Evita richieste se l'utente non è autenticato
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/gambling/conversions`, {
        params: { aff_var: user },
      });
      const conversionData = response.data.conversions || [];
      const sortedConversions = conversionData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setConversions(sortedConversions);
    } catch (err) {
      console.error('Errore nel recupero delle conversioni:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Funzione per aggiornare le conversioni dall'API esterna
  const updateConversions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/gambling/fetch-conversions`);
      await fetchConversions();
      return response.data.count; // Ritorna il numero di nuove conversioni
    } catch (err) {
      console.error('Errore durante l\'aggiornamento delle conversioni:', err);
      throw err;
    }
  };

  // Carica le conversioni all'inizializzazione del contesto
  useEffect(() => {
    fetchConversions();
  }, [user]);

  return (
    <ConversionContext.Provider value={{ conversions, loading, error, fetchConversions, updateConversions }}>
      {children}
    </ConversionContext.Provider>
  );
};
