import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { 
  Send, 
  Edit, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock 
} from 'lucide-react';

const NewsletterManagement = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [newNewsletter, setNewNewsletter] = useState({
    title: '',
    subject: '',
    content: '',
    language: 'it',
    scheduledAt: new Date().toISOString().slice(0, 16)
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const fetchNewsletters = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/newsletters`);
      
      // Log the response to see its structure
      console.log('Newsletter response:', response.data);

      // Ensure we always have an array
      setNewsletters(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Fetch error:', error);
      handleError('Errore nel recupero delle newsletter');
      setNewsletters([]); // Ensure newsletters is an array even on error
    }
  };

  const createNewsletter = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/newsletters`, {
        ...newNewsletter,
        createdBy: 'admin' // Assumendo autenticazione admin
      });
      
      setNewsletters([response.data, ...newsletters]);
      setMessage('Newsletter creata con successo');
      setMessageType('success');
      resetForm();
    } catch (error) {
      handleError('Errore nella creazione della newsletter');
    }
  };

  const sendNewsletter = async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/newsletters/${id}/send`);
      
      setNewsletters(newsletters.map(newsletter => 
        newsletter._id === id 
          ? { ...newsletter, status: 'sent', recipients: response.data.results }
          : newsletter
      ));
      
      setMessage(`Newsletter inviata. Totale: ${response.data.results.total}, Successo: ${response.data.results.successful}`);
      setMessageType('success');
    } catch (error) {
      handleError('Errore nell\'invio della newsletter');
    }
  };

  const handleError = (errorMessage) => {
    setMessage(errorMessage);
    setMessageType('error');
    console.error(errorMessage);
  };

  const resetForm = () => {
    setNewNewsletter({
      title: '',
      subject: '',
      content: '',
      language: 'it',
      scheduledAt: new Date().toISOString().slice(0, 16)
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': 
        return <Edit className="text-yellow-500" />;
      case 'scheduled': 
        return <Clock className="text-blue-500" />;
      case 'sent': 
        return <CheckCircle className="text-green-500" />;
      default: 
        return <XCircle className="text-red-500" />;
    }
  };

  useEffect(() => {
    fetchNewsletters();
  }, []);

  return (
    <div className="container mx-auto p-4 bg-white">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestione Newsletter</h1>

      {message && (
        <div className={`
          p-3 rounded-lg mb-4 
          ${messageType === 'success' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'}
        `}>
          {message}
        </div>
      )}

      {/* Form Creazione Newsletter */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Nuova Newsletter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Titolo"
            value={newNewsletter.title}
            onChange={(e) => setNewNewsletter({...newNewsletter, title: e.target.value})}
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Oggetto"
            value={newNewsletter.subject}
            onChange={(e) => setNewNewsletter({...newNewsletter, subject: e.target.value})}
            className="w-full p-2 border rounded-lg"
          />
          <select
            value={newNewsletter.language}
            onChange={(e) => setNewNewsletter({...newNewsletter, language: e.target.value})}
            className="w-full p-2 border rounded-lg"
          >
            <option value="it">Italiano</option>
            <option value="en">Inglese</option>
            <option value="de">Tedesco</option>
            <option value="es">Spagnolo</option>
          </select>
          <input
            type="datetime-local"
            value={newNewsletter.scheduledAt}
            onChange={(e) => setNewNewsletter({...newNewsletter, scheduledAt: e.target.value})}
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <textarea
          placeholder="Contenuto Newsletter"
          value={newNewsletter.content}
          onChange={(e) => setNewNewsletter({...newNewsletter, content: e.target.value})}
          className="w-full p-2 border rounded-lg mt-4 h-40"
        />
        <button
          onClick={createNewsletter}
          className="mt-4 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
        >
          Crea Newsletter
        </button>
      </div>

      {/* Lista Newsletter */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Newsletter Esistenti</h2>
        {newsletters.length === 0 ? (
          <p className="text-gray-500">Nessuna newsletter creata</p>
        ) : (
          <div className="space-y-4">
            {newsletters.map(newsletter => (
              <div 
                key={newsletter._id} 
                className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(newsletter.status)}
                    <h3 className="font-semibold text-gray-800">{newsletter.title}</h3>
                  </div>
                  <p className="text-gray-600">
                    {newsletter.language.toUpperCase()} | 
                    {new Date(newsletter.scheduledAt).toLocaleString()}
                  </p>
                  {newsletter.status === 'sent' && (
                    <p className="text-sm text-gray-500">
                      Inviata: {newsletter.recipients.successful}/{newsletter.recipients.total}
                    </p>
                  )}
                </div>
                {newsletter.status !== 'sent' && (
                  <button
                    onClick={() => sendNewsletter(newsletter._id)}
                    className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition flex items-center"
                    title="Invia Newsletter"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterManagement;