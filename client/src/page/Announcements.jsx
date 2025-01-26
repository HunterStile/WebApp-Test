import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, AlertTriangle } from 'lucide-react';
import API_BASE_URL from '../config';

const UserAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/announcements`);
      const sortedAnnouncements = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setAnnouncements(sortedAnnouncements);
      setError(null);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError('Impossibile caricare gli annunci. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600 dark:text-gray-400">
        Caricamento annunci...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600 dark:text-gray-400">
        Nessun annuncio disponibile
      </div>
    );
  }

  return (
    <div className="p-8 bg-white dark:bg-dark-bg rounded-xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-dark-text">
        Annunci
      </h1>
      
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div 
            key={announcement._id} 
            className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-accent rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center mb-2">
              {announcement.priority === 'high' ? (
                <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" />
              ) : (
                <Megaphone className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2" />
              )}
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
                {announcement.title}
              </h2>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                announcement.priority === 'high' 
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              }`}>
                {announcement.priority === 'high' ? 'Importante' : 'Informazione'}
              </span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {announcement.content}
            </p>
            
            <div className="text-sm text-gray-500 dark:text-gray-500 flex items-center">
              {new Date(announcement.createdAt).toLocaleString('it-IT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
              {announcement.category && (
                <>
                  <span className="mx-2">•</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {announcement.category}
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserAnnouncements;