import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Funzione per il login dell'utente
  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', { username, password });
      setUser(username); // Setta il nome utente dopo il login
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Funzione per il logout dell'utente
  const logout = () => {
    setUser(null);
  };

  // Funzione per verificare se l'utente è autenticato
  useEffect(() => {
    // Potresti aggiungere un controllo qui se vuoi verificare la sessione dell'utente
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
