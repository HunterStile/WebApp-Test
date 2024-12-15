import React, { createContext, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(localStorage.getItem('admin') || null);

  // Funzione per il login
  const login = async (username, password) => {
    try {
      await axios.post(`${API_BASE_URL}/admin/auth/login`, { username, password });
      setAdmin(username);
      localStorage.setItem('admin', username);
    } catch (error) {
      console.error('Login admin fallito:', error);
    }
  };

  // Funzione per la registrazione
  const register = async (username, password, secretKey) => {
    try {
      await axios.post(`${API_BASE_URL}/admin/auth/register`, { username, password, secretKey });
      alert('Registrazione admin riuscita!');
    } catch (error) {
      console.error('Registrazione admin fallita:', error);
    }
  };

  // Funzione per il logout
  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, register, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
