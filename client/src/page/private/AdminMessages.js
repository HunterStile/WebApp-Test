import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/messages/admin`);
        setMessages(response.data);
      } catch (error) {
        console.error('Errore nel recupero dei messaggi:', error);
      }
    };

    fetchMessages();
  }, []);

  const handleReply = async (messageId, sender) => {
    try {
      await axios.put(`${API_BASE_URL}/messages/admin/${messageId}`, {
        content: replyContent,
      });
      alert(`Risposta inviata a ${sender}`);
      setReplyContent(''); // Resetta il campo risposta
    } catch (error) {
      console.error('Errore nell\'invio della risposta:', error);
      alert('Errore nell\'invio della risposta');
    }
  };

  return (
    <div>
      <h2>Messaggi Admin</h2>
      {messages.map((msg) => (
        <div key={msg._id}>
          <h3>{msg.subject || 'Nessun oggetto'}</h3>
          <p>{msg.content}</p>
          <p><strong>Da:</strong> {msg.sender}</p>
          <p><strong>A:</strong> {msg.receiver}</p>
          <p><strong>Data:</strong> {new Date(msg.timestamp).toLocaleString()}</p>

          {/* Form di risposta */}
          <textarea
            placeholder="Scrivi una risposta..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <button onClick={() => handleReply(msg._id, msg.sender)}>
            Invia Risposta
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminMessages;
