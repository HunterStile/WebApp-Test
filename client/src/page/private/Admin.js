import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';

const AdminCampaignManagement = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Recupera le richieste pending
  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/pending-requests`);
      setPendingRequests(response.data);
    } catch (error) {
      handleError(error);
    }
  };

  // Recupera le richieste per un utente specifico
  const fetchUserRequests = async () => {
    if (!selectedUsername) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/admin/user-campaign-requests/${selectedUsername}`);
      setUserRequests(response.data);
    } catch (error) {
      handleError(error);
    }
  };

  // Aggiorna lo stato di una richiesta
  const updateRequestStatus = async (requestId, status) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/admin/update-request/${requestId}`, { status });
      
      // Aggiorna lo stato localmente
      setPendingRequests(prevRequests => 
        prevRequests.filter(request => request._id !== requestId)
      );

      setMessage(`Richiesta ${status.toLowerCase()} con successo`);
      setMessageType('success');
    } catch (error) {
      handleError(error);
    }
  };

  // Gestione degli errori
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
    <div className="admin-campaign-management">
      <h1>Gestione Campagne</h1>

      {/* Sezione Richieste Pending */}
      <div className="pending-requests">
        <h2>Richieste in Sospeso</h2>
        {pendingRequests.map(request => (
          <div key={request._id} className="request-card">
            <p>Username: {request.username}</p>
            <p>Campagna: {request.campaign}</p>
            <div className="request-actions">
              <button 
                onClick={() => updateRequestStatus(request._id, 'APPROVED')}
                className="approve-btn"
              >
                Approva
              </button>
              <button 
                onClick={() => updateRequestStatus(request._id, 'REJECTED')}
                className="reject-btn"
              >
                Rifiuta
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sezione Ricerca Richieste Utente */}
      <div className="user-requests">
        <h2>Richieste per Utente</h2>
        <input 
          type="text" 
          value={selectedUsername}
          onChange={(e) => setSelectedUsername(e.target.value)}
          placeholder="Inserisci username"
        />
        
        {userRequests.map(request => (
          <div key={request._id} className="request-card">
            <p>Campagna: {request.campaign}</p>
            <p>Stato: {request.status}</p>
            {request.uniqueLink && (
              <p>Link: {request.uniqueLink}</p>
            )}
            {request.realRedirectUrl && (
              <p>URL Redirect: {request.realRedirectUrl}</p>
            )}
          </div>
        ))}
      </div>

      {/* Messaggio di stato */}
      {message && (
        <div 
          className={`message ${messageType}`}
          style={{ 
            color: messageType === 'success' ? 'green' : 'red',
            marginTop: '10px' 
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default AdminCampaignManagement;