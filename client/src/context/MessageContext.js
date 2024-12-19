import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async (username) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/messages`, { params: { username } });
      setMessages(response.data);
    } catch (error) {
      console.error('Errore nel recupero dei messaggi:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageData) => {
    try {
      await axios.post(`${API_BASE_URL}/messages`, messageData);
      fetchMessages(messageData.receiver);
    } catch (error) {
      console.error('Errore nell\'invio del messaggio:', error);
    }
  };

  return (
    <MessageContext.Provider value={{ messages, loading, fetchMessages, sendMessage }}>
      {children}
    </MessageContext.Provider>
  );
};
