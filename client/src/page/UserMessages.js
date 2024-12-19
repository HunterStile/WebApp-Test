import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config';

const UserMessages = () => {
  const { user } = useContext(AuthContext); // Ottieni l'utente dal contesto
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) {
        setError('Utente non loggato');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/messages`, {
          params: { username: user }, // Passa il username come query param
        });
        setMessages(response.data);
      } catch (err) {
        console.error('Errore nel recupero dei messaggi:', err);
        setError('Errore nel recupero dei messaggi');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_BASE_URL}/messages`, {
        ...newMessage,
        sender: user, // Imposta l'utente loggato come mittente
        receiver: 'admin', // Imposta di default il destinatario come admin
      });
      setNewMessage({ subject: '', content: '' }); // Reset form
      alert('Messaggio inviato!');
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
      {messages.length === 0 ? (
        <p>Non ci sono messaggi.</p>
      ) : (
        <ul>
          {messages.map((message) => (
            <li key={message._id}>
              <h2>{message.subject}</h2>
              <p>{message.content}</p>
              <small>Da: {message.sender}</small>
            </li>
          ))}
        </ul>
      )}

      <h2>Invia un messaggio</h2>
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
