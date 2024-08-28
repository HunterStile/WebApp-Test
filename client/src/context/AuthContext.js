import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tcBalance, setTcBalance] = useState(0);

  // Funzione per il login dell'utente
  const login = async (username, password) => {
    try {
      await axios.post('http://localhost:3000/api/auth/login', { username, password });
      setUser(username);
      fetchTcBalance(username);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Funzione per il logout dell'utente
  const logout = () => {
    setUser(null);
    setTcBalance(0);
  };

  // Funzione per spendere TC
  const spendTc = async (amount) => {
    if (tcBalance >= amount) {
      try {
        await axios.post('http://localhost:3000/api/tc/spend', { username: user, amount });
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
        const response = await axios.get(`http://localhost:3000/api/tc/balance?username=${username}`);
        setTcBalance(response.data.tcBalance);
      } catch (error) {
        console.error('Error fetching TC balance:', error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchTcBalance();
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, tcBalance, setTcBalance, login, logout, spendTc, fetchTcBalance }}>
      {children}
    </AuthContext.Provider>
  );
};
