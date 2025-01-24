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
  const [unreadMessages, setUnreadMessages] = useState(new Set());

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
      // Mark messages as read when opening thread
      await axios.post(`${API_BASE_URL}/threads/${threadId}/messages/read`, {
        username: user
      });

      // Update unread state
      setUnreadMessages(new Set(
        response.data
          .filter(msg => msg.sender !== user && !msg.readBy.includes(user))
          .map(msg => msg._id)
      ));
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

  const handleThreadClick = async (thread) => {
    setActiveThread(thread);
    
    try {
      // Mark messages as read
      await axios.post(`${API_BASE_URL}/threads/${thread._id}/messages/read`, {
        username: user
      });

      // Update threads list to reflect read status
      const updatedThreads = threads.map(t => {
        if (t._id === thread._id && t.lastMessage) {
          return {
            ...t,
            lastMessage: {
              ...t.lastMessage,
              readBy: [...(t.lastMessage.readBy || []), user]
            }
          };
        }
        return t;
      });
      setThreads(updatedThreads);

      // Update navbar unread count immediately
      if (window.updateNavbarUnreadCount) {
        window.updateNavbarUnreadCount();
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left sidebar */}
      <div className="w-80 border-r border-gray-200">
        <div className="p-4 border-b flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Threads</h1>
          <button
            onClick={() => setIsNewThreadModalOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full py-2 px-4 bg-gray-100 rounded-full text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Thread list */}
        <div className="overflow-y-auto">
          {threads.map(thread => (
            <div
              key={thread._id}
              onClick={() => handleThreadClick(thread)}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${activeThread?._id === thread._id ? 'bg-gray-100' : ''
                }`}
            >
              <div className="flex justify-between items-start">
                <div className="font-medium text-gray-800 flex items-center gap-2">
                  {thread.subject}
                  {thread.lastMessage &&
                    !thread.lastMessage.readBy.includes(user) &&
                    thread.lastMessage.sender !== user && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(thread.lastActivity).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              {thread.lastMessage && (
                <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                  {thread.lastMessage.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {activeThread ? (
          <>
            <div className="p-4 border-b flex justify-between items-center bg-white">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{activeThread.subject}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.sender === user ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[60%] rounded-2xl px-4 py-2 ${message.sender === user
                      ? 'bg-dark-green text-white'
                      : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    <div className="text-sm">{message.content}</div>
                    <div className="text-xs mt-1 opacity-75">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {activeThread.isOpen && (
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here.."
                    className="flex-1 py-2 px-4 bg-gray-100 rounded-full text-sm focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="text-dark-green p-2 hover:bg-gray-100 rounded-full"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a thread to view messages
          </div>
        )}
      </div>

      {/* New Thread Modal */}
      {isNewThreadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">New Thread</h2>
            <form onSubmit={handleCreateThread} className="space-y-4">
              <input
                type="text"
                placeholder="Subject"
                value={newThreadData.subject}
                onChange={(e) => setNewThreadData({
                  ...newThreadData,
                  subject: e.target.value
                })}
                className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <textarea
                placeholder="Message"
                value={newThreadData.content}
                onChange={(e) => setNewThreadData({
                  ...newThreadData,
                  content: e.target.value
                })}
                className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
                required
              />
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsNewThreadModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-dark-green text-white rounded-lg hover:bg-green-600"
                >
                  Create Thread
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