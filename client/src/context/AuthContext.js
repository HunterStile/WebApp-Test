import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem('user') || null);
  const [tcBalance, setTcBalance] = useState(0);
  const [btcBalance, setBtcBalance] = useState(0);

  // Funzione per effettuare il login
  const login = async (username, password) => {
    try {
      // Chiamata all'API per il login
      await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
      // Imposta l'utente nel contesto e nel localStorage
      setUser(username);
      localStorage.setItem('user', username);
      // Aggiorna i bilanci
      fetchTcBalance(username);
      fetchBtcBalance(username);
    } catch (error) {
      console.error('Login fallito:', error);
    }
  };

  // Funzione per effettuare il logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setTcBalance(0);
    setBtcBalance(0);
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
        console.error('Errore nel recupero del saldo TC:', error);
      }
    }
  };

  // Funzione per ottenere il saldo BTC dal server
  const fetchBtcBalance = async (username = user) => {
    if (username) {
      try {
        const response = await axios.get(`${API_BASE_URL}/crypto/balance/${username}`);
        setBtcBalance(response.data.balance);
      } catch (error) {
        console.error('Errore nel recupero del saldo BTC:', error);
      }
    }
  };

  // Funzione per guadagnare TC
  const earnTc = async (amount, action) => {
    try {
      await axios.post(`${API_BASE_URL}/tc/earn`, { username: user, amount, action });
      fetchTcBalance(); // Aggiorna il saldo TC dopo aver guadagnato
    } catch (error) {
      console.error('Error earning TC:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTcBalance();
      fetchBtcBalance(); // Aggiorna anche il saldo BTC
      // Imposta un intervallo di aggiornamento ogni 30 secondi
      const interval = setInterval(() => {
        fetchBtcBalance();
        fetchTcBalance();
      }, 30000);

      // Pulisce l'intervallo quando il componente viene smontato o l'utente cambia
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, tcBalance, btcBalance, setTcBalance, setBtcBalance, login, logout, spendTc, fetchTcBalance, fetchBtcBalance, earnTc}}>
      {children}
    </AuthContext.Provider>
  );
};
