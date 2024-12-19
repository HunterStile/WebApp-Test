import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config';

const UserMessages = () => {
  const { user } = useContext(AuthContext); // Ottieni l'utente dal contesto
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Recupera i messaggi ricevuti
  const fetchReceivedMessages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages`, {
        params: { username: user }, // Passa il username come query param
      });
      setReceivedMessages(response.data);
    } catch (err) {
      console.error('Errore nel recupero dei messaggi ricevuti:', err);
      setError('Errore nel recupero dei messaggi ricevuti');
    }
  };

  // Recupera i messaggi inviati
  const fetchSentMessages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/sent`, {
        params: { username: user }, // Passa il username come query param
      });
      setSentMessages(response.data);
    } catch (err) {
      console.error('Errore nel recupero dei messaggi inviati:', err);
      setError('Errore nel recupero dei messaggi inviati');
    }
  };

  useEffect(() => {
    if (!user) {
      setError('Utente non loggato');
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([fetchReceivedMessages(), fetchSentMessages()]).finally(() =>
      setLoading(false)
    );
  }, [user]);

  // Gestione dell'invio del messaggio
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_BASE_URL}/messages`, {
        ...newMessage,
        sender: user, // Imposta l'utente loggato come mittente
        receiver: 'admin', // Destinatario predefinito: admin
      });
      setNewMessage({ subject: '', content: '' }); // Reset form
      alert('Messaggio inviato!');
      fetchSentMessages(); // Aggiorna i messaggi inviati
    } catch (err) {
      console.error('Errore nell\'invio del messaggio:', err);
      alert('Errore nell\'invio del messaggio');
    }
  };

  if (loading) return <p>Caricamento...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Messaggi</h1>

      <h2>Messaggi Ricevuti</h2>
      {receivedMessages.length === 0 ? (
        <p>Non ci sono messaggi ricevuti.</p>
      ) : (
        <ul>
          {receivedMessages.map((message) => (
            <li key={message._id}>
              <h3>{message.subject}</h3>
              <p>{message.content}</p>
              <small>Da: {message.sender}</small>
            </li>
          ))}
        </ul>
      )}

      <h2>Messaggi Inviati</h2>
      {sentMessages.length === 0 ? (
        <p>Non ci sono messaggi inviati.</p>
      ) : (
        <ul>
          {sentMessages.map((message) => (
            <li key={message._id}>
              <h3>{message.subject}</h3>
              <p>{message.content}</p>
              <small>A: {message.receiver}</small>
            </li>
          ))}
        </ul>
      )}

      <h2>Invia un Messaggio</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Oggetto"
          value={newMessage.subject}
          onChange={(e) =>
            setNewMessage({ ...newMessage, subject: e.target.value })
          }
          required
        />
        <textarea
          placeholder="Messaggio"
          value={newMessage.content}
          onChange={(e) =>
            setNewMessage({ ...newMessage, content: e.target.value })
          }
          required
        />
        <button type="submit">Invia</button>
      </form>
    </div>
  );
};

export default UserMessages;
