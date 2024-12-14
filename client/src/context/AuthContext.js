import React, { createContext, useState } from 'react';
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
    } catch (error) {
      console.error('Login fallito:', error);
    }
  };

  // Funzione per effettuare il logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Funzione per effettuare la registrazione
  const register = async (username, password) => {
    try {
      // Chiamata all'API per la registrazione
      await axios.post(`${API_BASE_URL}/auth/register`, { username, password });
      alert('Registrazione riuscita! Procedi con il login.');
    } catch (error) {
      console.error('Registrazione fallita:', error);
      throw new Error('Registrazione fallita');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
