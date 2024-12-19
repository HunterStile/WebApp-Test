import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, MessageCircle, Clock, User } from 'lucide-react';
import API_BASE_URL from '../../config';

const AdminMessages = () => {
  const [conversations, setConversations] = useState({});
  const [activeConversation, setActiveConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/admin`);
      
      // Organizza i messaggi in conversazioni uniche
      const groupedConversations = response.data.reduce((acc, message) => {
        // Per i messaggi inviati dall'admin, usa il receiver come chiave
        // Per i messaggi ricevuti dall'admin, usa il sender come chiave
        const conversationKey = message.sender === 'admin' ? message.receiver : message.sender;
        
        if (!acc[conversationKey]) {
          acc[conversationKey] = [];
        }
        
        acc[conversationKey].push({
          ...message,
          // Il messaggio è 'sent' se l'admin è il mittente, altrimenti è 'received'
          type: message.sender === 'admin' ? 'sent' : 'received'
        });
        return acc;
      }, {});

      // Ordina i messaggi in ogni conversazione per data
      Object.keys(groupedConversations).forEach(key => {
        groupedConversations[key].sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
      });

      setConversations(groupedConversations);
      setLoading(false);
    } catch (err) {
      console.error('Errore nel recupero dei messaggi:', err);
      setError('Errore nel recupero dei messaggi');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      // Usa l'endpoint admin per inviare un nuovo messaggio
      await axios.post(`${API_BASE_URL}/messages/admin`, {
        receiver: activeConversation,
        subject: 'RE: Conversazione',
        content: newMessage,
      });
      
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error('Errore nell\'invio della risposta:', err);
      alert('Errore nell\'invio della risposta');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-900 text-blue-200">Caricamento...</div>;
  if (error) return <div className="text-red-400 p-4 bg-gray-900">{error}</div>;

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar delle conversazioni */}
      <div className="w-1/3 bg-gray-800 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-blue-200 flex items-center gap-2">
            <MessageCircle size={24} />
            Dashboard Admin
          </h1>
        </div>
        <div className="overflow-y-auto h-full">
          {Object.entries(conversations).map(([userId, messages]) => (
            <div
              key={userId}
              onClick={() => setActiveConversation(userId)}
              className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-750 ${
                activeConversation === userId ? 'bg-gray-700' : ''
              }`}
            >
              <div className="font-semibold text-blue-200 flex items-center gap-2">
                <User size={18} />
                {userId}
              </div>
              {messages[messages.length - 1] && (
                <>
                  <div className="text-sm text-gray-400 truncate mt-1">
                    {messages[messages.length - 1].content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(messages[messages.length - 1].timestamp).toLocaleString()}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Area principale dei messaggi */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {activeConversation ? (
          <>
            <div className="p-4 border-b border-gray-700 bg-gray-800">
              <h2 className="text-lg font-semibold text-blue-200 flex items-center gap-2">
                <User size={20} />
                {activeConversation}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversations[activeConversation]?.map((message, index) => (
                <div
                  key={message._id || index}
                  className={`flex ${
                    message.type === 'sent' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.type === 'sent'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <div className="text-sm mb-1">{message.content}</div>
                    <div className="text-xs opacity-75">
                      {new Date(message.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Scrivi una risposta..."
                  className="flex-1 p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Seleziona una conversazione per visualizzare i messaggi
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;