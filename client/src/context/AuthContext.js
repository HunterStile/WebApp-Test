import React, { createContext, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem('user') || null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);

  // Funzione per effettuare il login
  const login = async (username, password) => {
    try {
      // Chiamata all'API per il login
      const response = await axios.post(`/api/auth/login`, { username, password });
      
      // Memorizza sia l'username che l'ID dell'utente
      const { userId } = response.data;
      
      // Imposta l'utente nel contesto e nel localStorage
      setUser(username);
      setUserId(userId);
      localStorage.setItem('user', username);
      localStorage.setItem('userId', userId);
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
    setUserId(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
  };

  // Funzione per effettuare la registrazione
  const register = async (userData) => {
    try {
      const response = await axios.post(`/api/auth/register`, {
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
    <AuthContext.Provider value={{ user, userId, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
