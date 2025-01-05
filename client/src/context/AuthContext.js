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
      if (error.response && error.response.data && error.response.data.error) {
        throw error; // Passa l'errore al componente per la gestione
      }
      throw new Error('Errore durante il login');
    }
  };

  // Funzione per effettuare il logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Funzione per effettuare la registrazione
  const register = async (userData) => {
    try {
      console.log('Captcha token being sent:', userData.captcha);
      console.log('Dati inviati per la registrazione:', userData);
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username: userData.username,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        country: userData.country,
        language: userData.language,
        acceptedTerms: userData.acceptedTerms,
        newsletterSubscription: userData.newsletterSubscription,
        captchaToken: userData.captcha
      });
      
      return response.data;
    } catch (error) {
       // Gestione più dettagliata degli errori
       if (error.response && error.response.data && error.response.data.error) {
        throw error; // Passa l'errore specifico al componente
      }
      throw new Error('Errore durante la registrazione');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
