import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Check, Send, RefreshCw } from 'lucide-react';

const ContactAdmin = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [response, setResponse] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch contacts from your API
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contacts');
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      showMessage('Errore nel caricamento dei contatti', 'error');
    } finally {
      setLoading(false);
    }
  };

  const searchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contacts/search?email=${searchEmail}`);
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      showMessage('Errore nella ricerca', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendResponse = async (contactId) => {
    try {
      const res = await fetch('/api/contacts/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId,
          response,
        }),
      });

      if (res.ok) {
        showMessage('Risposta inviata con successo', 'success');
        setResponse('');
        fetchContacts();
      } else {
        throw new Error('Errore nell\'invio della risposta');
      }
    } catch (error) {
      showMessage('Errore nell\'invio della risposta', 'error');
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      inProgress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestione Contatti</h1>

      {/* Status Message */}
      {message && (
        <div
          className={`p-3 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      {/* Search Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Cerca Contatti</h2>
        <div className="flex mb-4">
          <input
            type="text"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Cerca per email"
            className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={searchContacts}
            className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 transition flex items-center"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">Messaggi</h2>
          <button
            onClick={fetchContacts}
            className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition"
            title="Aggiorna"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Caricamento...</p>
        ) : contacts.length === 0 ? (
          <p className="text-gray-500">Nessun messaggio trovato</p>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div
                key={contact._id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-medium text-gray-800">
                      <span className="font-bold">Nome:</span> {contact.name}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-bold">Email:</span> {contact.email}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(contact.status)}`}>
                    {contact.status}
                  </span>
                </div>

                <div className="mt-2">
                  <p className="text-gray-700">
                    <span className="font-bold">Messaggio:</span>
                  </p>
                  <p className="mt-1 text-gray-600 whitespace-pre-wrap">{contact.message}</p>
                </div>

                {contact.responses?.length > 0 && (
                  <div className="mt-4">
                    <p className="font-bold text-gray-700 mb-2">Risposte precedenti:</p>
                    {contact.responses.map((resp, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded mt-2">
                        <p className="text-gray-600">{resp.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(resp.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Response Form */}
                {selectedContact === contact._id ? (
                  <div className="mt-4">
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Scrivi una risposta..."
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => setSelectedContact(null)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      >
                        Annulla
                      </button>
                      <button
                        onClick={() => sendResponse(contact._id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Invia</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedContact(contact._id)}
                    className="mt-4 text-blue-500 hover:text-blue-600 transition flex items-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Rispondi</span>
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

export default ContactAdmin;