import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { Check, X, Search, Copy, RefreshCw, Power } from 'lucide-react';

const AdminCampaignManagement = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [copiedLink, setCopiedLink] = useState(null);

  // Fetch pending requests
  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/pending-requests`);
      setPendingRequests(response.data);
    } catch (error) {
      handleError(error);
    }
  };

  // Fetch user requests
  const fetchUserRequests = async () => {
    if (!selectedUsername) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/admin/user-campaign-requests/${selectedUsername}`);
      setUserRequests(response.data);
    } catch (error) {
      handleError(error);
    }
  };

  // Update request status
  const updateRequestStatus = async (requestId, status) => {
    try {
      await axios.patch(`${API_BASE_URL}/admin/update-request/${requestId}`, { status });

      // Update local state
      setPendingRequests(prevRequests =>
        prevRequests.filter(request => request._id !== requestId)
      );

      // Refresh requests
      fetchPendingRequests();
      if (selectedUsername) {
        fetchUserRequests();
      }

      setMessage(`Richiesta ${status.toLowerCase()} con successo`);
      setMessageType('success');
    } catch (error) {
      handleError(error);
    }
  };

  const reapproveRequest = async (requestId) => {
    try {
      await updateRequestStatus(requestId, 'APPROVED');
      setMessage('Campagna riapprovata con successo');
      setMessageType('success');

      // Aggiorna la lista delle richieste
      if (selectedUsername) {
        fetchUserRequests();
      }
    } catch (error) {
      handleError(error);
    }
  };

  const deactivateRequest = async (requestId) => {
    try {
      await updateRequestStatus(requestId, 'DEACTIVATED');
      setMessage('Campagna disattivata con successo');
      setMessageType('success');

      if (selectedUsername) {
        fetchUserRequests();
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'DEACTIVATED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Copy to clipboard
  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(link);
      setTimeout(() => setCopiedLink(null), 2000);
    });
  };

  // Error handling
  const handleError = (error) => {
    console.error('Errore:', error);
    setMessage(
      error.response?.data?.message ||
      "Si è verificato un errore"
    );
    setMessageType('error');
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  useEffect(() => {
    if (selectedUsername) {
      fetchUserRequests();
    }
  }, [selectedUsername]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestione Campagne</h1>

      {/* Status Message */}
      {message && (
        <div
          className={`p-3 rounded-lg ${messageType === 'success'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
            }`}
        >
          {message}
        </div>
      )}

      {/* Pending Requests Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Richieste in Sospeso</h2>
        {pendingRequests.length === 0 ? (
          <p className="text-gray-500">Nessuna richiesta in sospeso</p>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map(request => (
              <div
                key={request._id}
                className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    <span className="font-bold">Username:</span> {request.username}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Campagna:</span> {request.campaign}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateRequestStatus(request._id, 'APPROVED')}
                    className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition flex items-center"
                    title="Approva"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => updateRequestStatus(request._id, 'REJECTED')}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition flex items-center"
                    title="Rifiuta"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Requests Search Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Richieste per Utente</h2>
        <div className="flex mb-4">
          <input
            type="text"
            value={selectedUsername}
            onChange={(e) => setSelectedUsername(e.target.value)}
            placeholder="Inserisci username"
            className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchUserRequests}
            className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 transition flex items-center"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {userRequests.length === 0 ? (
          <p className="text-gray-500">Nessuna richiesta trovata</p>
        ) : (
          <div className="space-y-4">
            {userRequests.map(request => (
              <div key={request._id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium text-gray-800">
                    <span className="font-bold">Campagna:</span> {request.campaign}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>

                    {/* Bottone di riapprovazione per richieste rifiutate o disattivate */}
                    {(request.status === 'REJECTED' || request.status === 'DEACTIVATED') && (
                      <button
                        onClick={() => reapproveRequest(request._id)}
                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition flex items-center"
                        title="Riapprova campagna"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}

                    {/* Bottone di disattivazione per richieste approvate */}
                    {request.status === 'APPROVED' && (
                      <button
                        onClick={() => deactivateRequest(request._id)}
                        className="bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600 transition flex items-center"
                        title="Disattiva campagna"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Mostra link e URL solo se la campagna è approvata */}
                {request.status === 'APPROVED' && (
                  <>
                    {request.uniqueLink && (
                      <div className="flex items-center space-x-2 mt-2">
                        <p className="text-gray-700">
                          <span className="font-bold">Link:</span> {request.uniqueLink}
                        </p>
                        <button
                          onClick={() => copyToClipboard(request.uniqueLink)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {copiedLink === request.uniqueLink ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    )}

                    {request.realRedirectUrl && (
                      <div className="flex items-center space-x-2 mt-2">
                        <p className="text-gray-700">
                          <span className="font-bold">URL Redirect:</span> {request.realRedirectUrl}
                        </p>
                        <button
                          onClick={() => copyToClipboard(request.realRedirectUrl)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {copiedLink === request.realRedirectUrl ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCampaignManagement;