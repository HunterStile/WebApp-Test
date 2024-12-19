import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Send, Lock } from 'lucide-react';
import API_BASE_URL from '../config';

const ThreadList = () => {
  const { user } = useContext(AuthContext);
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isNewThreadModalOpen, setIsNewThreadModalOpen] = useState(false);
  const [newThreadData, setNewThreadData] = useState({
    subject: '',
    content: ''
  });
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchThreads = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/threads/user/${user}`);
      setThreads(response.data);
    } catch (error) {
      console.error('Error fetching threads:', error);
    }
  };

  const fetchMessages = async (threadId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/threads/${threadId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchThreads();
    }
  }, [user]);

  useEffect(() => {
    if (activeThread) {
      fetchMessages(activeThread._id);
    }
  }, [activeThread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeThread) return;

    try {
      await axios.post(`${API_BASE_URL}/threads/${activeThread._id}/messages`, {
        sender: user,
        content: newMessage
      });
      
      setNewMessage('');
      fetchMessages(activeThread._id);
      fetchThreads(); // Aggiorna la lista dei thread per l'ultimo messaggio
    } catch (error) {
      if (error.response?.status === 403) {
        alert('Thread chiuso. Non è possibile inviare nuovi messaggi.');
      } else {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/threads`, {
        creator: user,
        ...newThreadData
      });
      
      setNewThreadData({ subject: '', content: '' });
      setIsNewThreadModalOpen(false);
      fetchThreads();
      setActiveThread(response.data);
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <div className="w-1/3 bg-gray-800 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-200">I miei Thread</h1>
          <button
            onClick={() => setIsNewThreadModalOpen(true)}
            className="p-2 rounded-full hover:bg-gray-700 text-blue-300"
          >
            <Plus size={24} />
          </button>
        </div>
        
        <div className="overflow-y-auto h-full">
          {threads.map(thread => (
            <div
              key={thread._id}
              onClick={() => setActiveThread(thread)}
              className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-750 ${
                activeThread?._id === thread._id ? 'bg-gray-700' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="font-semibold text-blue-200">{thread.subject}</div>
                {!thread.isOpen && <Lock size={16} className="text-red-400" />}
              </div>
              {thread.lastMessage && (
                <div className="text-sm text-gray-400 mt-2">
                  {thread.lastMessage.content.substring(0, 50)}...
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {new Date(thread.lastActivity).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-900">
        {activeThread ? (
          <>
            <div className="p-4 border-b border-gray-700 bg-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-blue-200">{activeThread.subject}</h2>
              {!activeThread.isOpen && (
                <span className="text-red-400 flex items-center gap-2">
                  <Lock size={16} />
                  Thread chiuso
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.sender === user ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender === user
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
              <div ref={messagesEndRef} />
            </div>

            {activeThread.isOpen && (
              <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Scrivi un messaggio..."
                    className="flex-1 p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Seleziona un thread per visualizzare i messaggi
          </div>
        )}
      </div>

      {isNewThreadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-blue-200">Nuovo Thread</h2>
            <form onSubmit={handleCreateThread} className="space-y-4">
              <input
                type="text"
                placeholder="Oggetto"
                value={newThreadData.subject}
                onChange={(e) => setNewThreadData({
                  ...newThreadData,
                  subject: e.target.value
                })}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                placeholder="Messaggio"
                value={newThreadData.content}
                onChange={(e) => setNewThreadData({
                  ...newThreadData,
                  content: e.target.value
                })}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                required
              />
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setIsNewThreadModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Crea Thread
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadList;