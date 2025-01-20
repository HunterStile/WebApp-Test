// components/UserAnnouncements.js
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
      // Ordina gli annunci per data, i più recenti prima
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
    return <div className="text-center p-4">Caricamento annunci...</div>;
  }

  if (error) {
    return <div className="text-center text-red-400 p-4">{error}</div>;
  }

  if (announcements.length === 0) {
    return <div className="text-center text-neutral-400 p-4">Nessun annuncio disponibile</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 px-6">Annunci</h2>
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div 
            key={announcement._id}
            className="p-6 rounded-lg bg-neutral-800 border border-neutral-600"
          >
            <div className="flex gap-4">
              {announcement.priority === 'high' ? (
                <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0" />
              ) : (
                <Megaphone className="h-6 w-6 text-blue-400 flex-shrink-0" />
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-neutral-200">
                    {announcement.title}
                  </h3>
                  <span className={`px-2 py-0.5 text-sm rounded ${
                    announcement.priority === 'high' 
                      ? 'bg-red-900/50 text-red-200' 
                      : 'bg-blue-900/50 text-blue-200'
                  }`}>
                    {announcement.priority === 'high' ? 'Importante' : 'Informazione'}
                  </span>
                </div>
                <p className="mt-2 text-neutral-300">{announcement.content}</p>
                <div className="mt-3 flex items-center gap-2 flex-wrap text-sm text-neutral-400">
                  <time dateTime={announcement.createdAt}>
                    {new Date(announcement.createdAt).toLocaleString('it-IT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </time>
                  {announcement.category && (
                    <>
                      <span className="text-neutral-500">•</span>
                      <span>{announcement.category}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserAnnouncements;