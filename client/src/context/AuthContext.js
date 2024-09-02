import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config'; // Importa l'URL di base

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tcBalance, setTcBalance] = useState(0);
  const [btcBalance, setBtcBalance] = useState(0); // Aggiungi il saldo BTC

  // Funzione per il login dell'utente
  const login = async (username, password) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, { username, password }); // Usa i backticks qui
      setUser(username);
      fetchTcBalance(username);
      fetchBtcBalance(username); // Aggiungi la funzione per aggiornare il saldo BTC
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Funzione per il logout dell'utente
  const logout = () => {
    setUser(null);
    setTcBalance(0);
    setBtcBalance(0); // Resetta il saldo BTC al logout
  };

  // Funzione per spendere TC
  const spendTc = async (amount) => {
    if (tcBalance >= amount) {
      try {
        await axios.post(`${API_BASE_URL}/tc/spend`, { username: user, amount }); // Usa i backticks qui
        setTcBalance(prevBalance => prevBalance - amount);
      } catch (error) {
        console.error('Error spending TC:', error);
      }
    } else {
      console.error('Insufficient TC balance');
    }
  };

  // Funzione per aggiornare il bilancio TC dal server
  const fetchTcBalance = async (username = user) => {
    if (username) {
      try {
        const response = await axios.get(`${API_BASE_URL}/tc/balance?username=${username}`);
        setTcBalance(response.data.tcBalance);
      } catch (error) {
        console.error('Error fetching TC balance:', error);
      }
    }
  };

  // Funzione per aggiornare il bilancio BTC dal server
  const fetchBtcBalance = async (username = user) => {
    if (username) {
      try {
        const response = await axios.get(`${API_BASE_URL}/crypto/balance/${username}`);
        setBtcBalance(response.data.balance);
      } catch (error) {
        console.error('Error fetching BTC balance:', error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchTcBalance();
      fetchBtcBalance(); // Aggiorna anche il saldo BTC
      // Imposta un intervallo di aggiornamento ogni 30 secondi
      const interval = setInterval(() => {
        fetchBtcBalance();
      }, 30000);

      // Pulisce l'intervallo quando il componente viene smontato o l'utente cambia
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, tcBalance, btcBalance, setTcBalance, setBtcBalance, login, logout, spendTc, fetchTcBalance, fetchBtcBalance }}>
      {children}
    </AuthContext.Provider>
  );
};
