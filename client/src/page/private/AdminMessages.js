import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, Send, Lock, Unlock, User, Clock, Filter } from 'lucide-react';
import API_BASE_URL from '../../config';

const AdminThreads = () => {
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'open', 'closed'
  const [searchTerm, setSearchTerm] = useState('');
  
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
        content: newMessage
      });
      
      setNewMessage('');
      fetchMessages(activeThread._id);
      fetchThreads();
    } catch (error) {
      console.error('Error sending message:', error);
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
    <div className="flex h-screen bg-gray-900">
      <div className="w-1/3 bg-gray-800 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-blue-200 flex items-center gap-2 mb-4">
            <MessageCircle size={24} />
            Gestione Thread
          </h1>
          
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Cerca thread o utente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg ${
                  filterStatus === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Tutti
              </button>
              <button
                onClick={() => setFilterStatus('open')}
                className={`px-3 py-1 rounded-lg ${
                  filterStatus === 'open' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Aperti
              </button>
              <button
                onClick={() => setFilterStatus('closed')}
                className={`px-3 py-1 rounded-lg ${
                  filterStatus === 'closed' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Chiusi
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-y-auto h-full">
          {filteredThreads.map(thread => (
            <div
              key={thread._id}
              onClick={() => setActiveThread(thread)}
              className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-750 ${
                activeThread?._id === thread._id ? 'bg-gray-700' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold text-blue-200 flex items-center gap-2">
                    <User size={16} />
                    {thread.creator}
                  </div>
                  <div className="text-sm text-gray-300 mt-1">{thread.subject}</div>
                </div>
                {!thread.isOpen && <Lock size={16} className="text-red-400" />}
              </div>
              
              {thread.lastMessage && (
                <div className="text-sm text-gray-400 mt-2">
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

      <div className="flex-1 flex flex-col bg-gray-900">
        {activeThread ? (
          <>
            <div className="p-4 border-b border-gray-700 bg-gray-800">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-400">Thread di {activeThread.creator}</div>
                  <h2 className="text-lg font-semibold text-blue-200">{activeThread.subject}</h2>
                </div>
                <button
                  onClick={() => toggleThreadStatus(activeThread._id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    activeThread.isOpen 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Seleziona un thread per visualizzare e gestire i messaggi
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminThreads;