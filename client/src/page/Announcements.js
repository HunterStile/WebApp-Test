// components/UserAnnouncements.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, AlertTriangle, X } from 'lucide-react';
import API_BASE_URL from '../config';

const UserAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState(
    JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]')
  );

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/announcements`);
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const dismissAnnouncement = (id) => {
    const newDismissed = [...dismissedAnnouncements, id];
    setDismissedAnnouncements(newDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
  };

  const visibleAnnouncements = announcements.filter(
    announcement => !dismissedAnnouncements.includes(announcement._id)
  );

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="space-y-2 p-4">
      {visibleAnnouncements.map((announcement) => (
        <div
          key={announcement._id}
          className={`relative p-4 rounded-lg ${
            announcement.priority === 'high'
              ? 'bg-red-900/20 border-red-500'
              : 'bg-blue-900/20 border-blue-500'
          } border`}
        >
          <button
            onClick={() => dismissAnnouncement(announcement._id)}
            className="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded-full"
          >
            <X size={16} className="text-gray-400" />
          </button>
          
          <div className="flex items-start gap-3">
            {announcement.priority === 'high' ? (
              <AlertTriangle className="text-red-400 flex-shrink-0" size={24} />
            ) : (
              <Megaphone className="text-blue-400 flex-shrink-0" size={24} />
            )}
            
            <div>
              <h3 className="font-semibold text-lg text-blue-200 mb-1">
                {announcement.title}
              </h3>
              <p className="text-gray-300">{announcement.content}</p>
              <div className="text-sm text-gray-400 mt-2">
                {new Date(announcement.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserAnnouncements;