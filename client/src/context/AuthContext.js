import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem('user') || null);
 

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


  return (
    <AuthContext.Provider value={{ user, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};
