import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Send } from 'lucide-react';
import API_BASE_URL from '../config';

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Funzione per aggiungere lo zero iniziale se necessario
  const padZero = (num) => num.toString().padStart(2, '0');
  
  const time = `${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
  
  if (date.toDateString() === today.toDateString()) {
    return `Oggi ${time}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Ieri ${time}`;
  } else {
    return `${padZero(date.getDate())}/${padZero(date.getMonth() + 1)}/${date.getFullYear()} ${time}`;
  }
};

const Conversations = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState({});
  const [activeConversation, setActiveConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [newConversationData, setNewConversationData] = useState({
    receiver: '',
    subject: '',
    content: ''
  });
  
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const fetchMessages = async () => {
    try {
      const [receivedResponse, sentResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/messages`, { params: { username: user } }),
        axios.get(`${API_BASE_URL}/messages/sent`, { params: { username: user } })
      ]);

      const allMessages = [
        ...receivedResponse.data.map(msg => ({ ...msg, type: 'received' })),
        ...sentResponse.data.map(msg => ({ ...msg, type: 'sent' }))
      ];

      const groupedConversations = allMessages.reduce((acc, message) => {
        const conversationId = message.type === 'received' ? message.sender : message.receiver;
        if (!acc[conversationId]) {
          acc[conversationId] = [];
        }
        acc[conversationId].push(message);
        return acc;
      }, {});

      Object.keys(groupedConversations).forEach(key => {
        groupedConversations[key].sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
      });

      setConversations(groupedConversations);
      setLoading(false);
      
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Errore nel recupero dei messaggi:', err);
      setError('Errore nel recupero dei messaggi');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setError('Utente non loggato');
      setLoading(false);
      return;
    }
    fetchMessages();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      await axios.post(`${API_BASE_URL}/messages`, {
        content: newMessage,
        subject: `Re: Conversazione con ${activeConversation}`,
        sender: user,
        receiver: activeConversation,
      });
      
      setNewMessage('');
      await fetchMessages();
      scrollToBottom();
    } catch (err) {
      console.error('Errore nell\'invio del messaggio:', err);
      alert('Errore nell\'invio del messaggio');
    }
  };

  const handleStartNewConversation = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/messages`, {
        ...newConversationData,
        sender: user,
      });
      
      setNewConversationData({ receiver: '', subject: '', content: '' });
      setIsNewConversationModalOpen(false);
      await fetchMessages();
      setActiveConversation(newConversationData.receiver);
    } catch (err) {
      console.error('Errore nell\'avvio della nuova conversazione:', err);
      alert('Errore nell\'avvio della nuova conversazione');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-900 text-blue-200">Caricamento...</div>;
  if (error) return <div className="text-red-400 p-4 bg-gray-900">{error}</div>;

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar delle conversazioni */}
      <div className="w-1/3 bg-gray-800 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-200">Conversazioni</h1>
          <button
            onClick={() => setIsNewConversationModalOpen(true)}
            className="p-2 rounded-full hover:bg-gray-700 text-blue-300"
          >
            <Plus size={24} />
          </button>
        </div>
        <div className="overflow-y-auto h-full">
          {Object.entries(conversations).map(([participantId, messages]) => {
            const lastMessage = messages[messages.length - 1];
            return (
              <div
                key={participantId}
                onClick={() => setActiveConversation(participantId)}
                className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-750 ${
                  activeConversation === participantId ? 'bg-gray-700' : ''
                }`}
              >
                <div className="font-semibold text-blue-200">{participantId}</div>
                {lastMessage && (
                  <div className="text-sm">
                    <div className="text-gray-400 truncate">
                      {lastMessage.content}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      {formatTimestamp(lastMessage.timestamp)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Area principale dei messaggi */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {activeConversation ? (
          <>
            <div className="p-4 border-b border-gray-700 bg-gray-800">
              <h2 className="text-lg font-semibold text-blue-200">{activeConversation}</h2>
            </div>

            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {conversations[activeConversation]?.map((message, index) => (
                <div
                  key={message._id || index}
                  className={`flex flex-col ${
                    message.type === 'sent' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.type === 'sent'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <div className="text-sm">{message.content}</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 px-1">
                    {formatTimestamp(message.timestamp)}
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
                  placeholder="Scrivi un messaggio..."
                  className="flex-1 p-2 border rounded-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Seleziona una conversazione per iniziare
          </div>
        )}
      </div>

      {/* Modal per nuova conversazione */}
      {isNewConversationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-blue-200">Nuova Conversazione</h2>
            <form onSubmit={handleStartNewConversation} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Destinatario"
                  value={newConversationData.receiver}
                  onChange={(e) => setNewConversationData({
                    ...newConversationData,
                    receiver: e.target.value
                  })}
                  className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Oggetto"
                  value={newConversationData.subject}
                  onChange={(e) => setNewConversationData({
                    ...newConversationData,
                    subject: e.target.value
                  })}
                  className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Messaggio"
                  value={newConversationData.content}
                  onChange={(e) => setNewConversationData({
                    ...newConversationData,
                    content: e.target.value
                  })}
                  className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setIsNewConversationModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Invia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conversations;