// components/AdminAnnouncements.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Plus, AlertTriangle } from 'lucide-react';
import API_BASE_URL from '../../config';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isNewAnnouncementModalOpen, setIsNewAnnouncementModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'medium'
  });

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/announcements/admin`);
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/announcements`, newAnnouncement);
      setIsNewAnnouncementModalOpen(false);
      setNewAnnouncement({ title: '', content: '', priority: 'medium' });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const toggleAnnouncementStatus = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/announcements/${id}/toggle`);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error toggling announcement status:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-200 flex items-center gap-2">
          <Megaphone />
          Gestione Annunci
        </h2>
        <button
          onClick={() => setIsNewAnnouncementModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="inline-block mr-2" size={20} />
          Nuovo Annuncio
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement._id}
            className={`p-4 rounded-lg border ${
              announcement.isActive ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-gray-800'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-blue-200 flex items-center gap-2">
                  {announcement.priority === 'high' && (
                    <AlertTriangle className="text-red-400" size={20} />
                  )}
                  {announcement.title}
                </h3>
                <div className="text-sm text-gray-400">
                  {new Date(announcement.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => toggleAnnouncementStatus(announcement._id)}
                className={`px-3 py-1 rounded-lg ${
                  announcement.isActive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {announcement.isActive ? 'Disattiva' : 'Riattiva'}
              </button>
            </div>
            <p className="text-gray-300">{announcement.content}</p>
          </div>
        ))}
      </div>

      {isNewAnnouncementModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-blue-200">Nuovo Annuncio</h2>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <input
                type="text"
                placeholder="Titolo"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({
                  ...newAnnouncement,
                  title: e.target.value
                })}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                required
              />
              <textarea
                placeholder="Contenuto"
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({
                  ...newAnnouncement,
                  content: e.target.value
                })}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white min-h-[100px]"
                required
              />
              <select
                value={newAnnouncement.priority}
                onChange={(e) => setNewAnnouncement({
                  ...newAnnouncement,
                  priority: e.target.value
                })}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
              >
                <option value="low">Bassa Priorità</option>
                <option value="medium">Media Priorità</option>
                <option value="high">Alta Priorità</option>
              </select>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setIsNewAnnouncementModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Pubblica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;