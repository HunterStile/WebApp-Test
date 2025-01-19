import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, Send, Lock, Unlock, User, Clock, Plus } from 'lucide-react';
import API_BASE_URL from '../../config';

const AdminThreads = () => {
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewThreadModalOpen, setIsNewThreadModalOpen] = useState(false);
  const [newThreadData, setNewThreadData] = useState({
    subject: '',
    content: '',
    targetUser: '' // Nuovo campo per l'utente destinatario
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchThreads = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/threads/admin`);
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
    fetchThreads();
  }, []);

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
        sender: 'admin',
        content: newMessage,
        isAdminMessage: true // Indichiamo che è un messaggio dell'admin
      });
      
      setNewMessage('');
      fetchMessages(activeThread._id);
      fetchThreads();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/threads`, {
        creator: newThreadData.targetUser,
        subject: newThreadData.subject,
        content: newThreadData.content,
        isAdminCreated: true // Indichiamo che è creato dall'admin
      });
      
      setNewThreadData({ subject: '', content: '', targetUser: '' });
      setIsNewThreadModalOpen(false);
      fetchThreads();
      setActiveThread(response.data);
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const toggleThreadStatus = async (threadId) => {
    try {
      await axios.patch(`${API_BASE_URL}/threads/${threadId}/toggle-status`);
      fetchThreads();
      if (activeThread?._id === threadId) {
        setActiveThread(prev => ({ ...prev, isOpen: !prev.isOpen }));
      }
    } catch (error) {
      console.error('Error toggling thread status:', error);
    }
  };

  const filteredThreads = threads.filter(thread => {
    const matchesStatus = 
      filterStatus === 'all' ? true :
      filterStatus === 'open' ? thread.isOpen :
      !thread.isOpen;
    
    const matchesSearch = 
      thread.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.creator.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex h-screen bg-white">
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MessageCircle size={24} />
              Gestione Thread
            </h1>
            <button
              onClick={() => setIsNewThreadModalOpen(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Cerca thread o utente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 rounded-lg bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg ${
                  filterStatus === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Tutti
              </button>
              <button
                onClick={() => setFilterStatus('open')}
                className={`px-3 py-1 rounded-lg ${
                  filterStatus === 'open' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Aperti
              </button>
              <button
                onClick={() => setFilterStatus('closed')}
                className={`px-3 py-1 rounded-lg ${
                  filterStatus === 'closed' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Chiusi
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.map(thread => (
            <div
              key={thread._id}
              onClick={() => setActiveThread(thread)}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${
                activeThread?._id === thread._id ? 'bg-gray-100' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 flex items-center gap-2">
                    <User size={16} />
                    {thread.creator}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{thread.subject}</div>
                </div>
                {!thread.isOpen && <Lock size={16} className="text-red-500" />}
              </div>
              
              {thread.lastMessage && (
                <div className="text-sm text-gray-500 mt-2">
                  {thread.lastMessage.content.substring(0, 50)}...
                </div>
              )}
              
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(thread.lastActivity).toLocaleDateString()}
                </div>
                <div>
                  {thread.messageCount} messaggi
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeThread ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">Thread di {activeThread.creator}</div>
                  <h2 className="text-lg font-semibold text-gray-800">{activeThread.subject}</h2>
                </div>
                <button
                  onClick={() => toggleThreadStatus(activeThread._id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    activeThread.isOpen 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {activeThread.isOpen ? (
                    <>
                      <Lock size={16} />
                      Chiudi Thread
                    </>
                  ) : (
                    <>
                      <Unlock size={16} />
                      Riapri Thread
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender === 'admin'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
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

            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Scrivi una risposta..."
                  className="flex-1 p-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Seleziona un thread per visualizzare e gestire i messaggi
          </div>
        )}
      </div>

{/* Modal Nuovo Thread */}
      {isNewThreadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Nuovo Thread</h2>
            <form onSubmit={handleCreateThread} className="space-y-4">
              <input
                type="text"
                placeholder="Username utente"
                value={newThreadData.targetUser}
                onChange={(e) => setNewThreadData({
                  ...newThreadData,
                  targetUser: e.target.value
                })}
                className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Oggetto"
                value={newThreadData.subject}
                onChange={(e) => setNewThreadData({
                  ...newThreadData,
                  subject: e.target.value
                })}
                className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                placeholder="Messaggio"
                value={newThreadData.content}
                onChange={(e) => setNewThreadData({
                  ...newThreadData,
                  content: e.target.value
                })}
                className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                required
              />
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsNewThreadModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

export default AdminThreads;