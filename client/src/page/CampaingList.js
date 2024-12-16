import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config';
import axios from 'axios';

const CampaignRequestOverview = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [userRequests, setUserRequests] = useState({
    pending: [],
    approved: [],
    rejected: []
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const { user } = useContext(AuthContext);

  // Carica le campagne disponibili
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/cpc/campaigns`);
        setCampaigns(response.data);
      } catch (error) {
        console.error('Errore nel recupero delle campagne:', error);
        setMessage('Errore nel recupero delle campagne');
        setMessageType('error');
      }
    };

    fetchCampaigns();
  }, []);

  // Carica le richieste dell'utente
  useEffect(() => {
    const fetchUserRequests = async () => {
      if (!user) return;

      try {
        const response = await axios.get(`${API_BASE_URL}/cpc/user-requests`, {
          params: { username: user }
        });

        setUserRequests({
          pending: response.data.pendingRequests || [],
          approved: response.data.approvedRequests || [],
          rejected: response.data.rejectedRequests || []
        });
      } catch (error) {
        console.error('Errore nel recupero delle richieste:', error);
        setMessage('Errore nel recupero delle richieste');
        setMessageType('error');
      }
    };

    fetchUserRequests();
  }, [user]);

  const handleRequestCampaign = async (campaignName) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cpc/campaign-requests`, {
        campaign: campaignName,
        username: user,
      });

      // Aggiorna lo stato locale aggiungendo la richiesta nella lista pending
      setUserRequests((prev) => ({
        ...prev,
        pending: [...prev.pending, response.data]
      }));

      setMessage(`Richiesta per la campagna "${campaignName}" inviata`);
      setMessageType('success');
    } catch (error) {
      console.error('Errore nella richiesta:', error);
      setMessage('Errore nell\'invio della richiesta');
      setMessageType('error');
    }
  };

  const isCampaignRequested = (campaignName) => {
    return (
      userRequests.pending.some((req) => req.campaign === campaignName) ||
      userRequests.approved.some((req) => req.campaign === campaignName)
    );
  };

  return (
    <div className="campaign-request-overview">
      <h1>Gestione Campagne</h1>

      {/* Sezione Richiesta Nuova Campagna */}
      <div className="new-campaign-request">
        <h2>Richiedi Nuova Campagna</h2>
        {campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <div key={campaign.name} className="campaign-item">
              <h3>{campaign.name}</h3>
              <p>{campaign.description}</p>
              <p>{campaign.conditions}</p>
              <p>{campaign.commissionPlan}</p>
              <p>{campaign.status}</p>
              <button
                onClick={() => handleRequestCampaign(campaign.name)}
                disabled={isCampaignRequested(campaign.name)}
              >
                {isCampaignRequested(campaign.name)
                  ? 'In Attesa'
                  : 'Richiedi Campagna'}
              </button>
            </div>
          ))
        ) : (
          <p>Nessuna campagna disponibile.</p>
        )}
      </div>

      {/* Sezione Riepilogo Richieste */}
      <div className="requests-summary">
        <h2>Le Tue Richieste</h2>

        {userRequests.pending.length > 0 && (
          <div className="request-section pending-requests">
            <h3>Richieste in Attesa</h3>
            {userRequests.pending.map((request) => (
              <div key={request._id} className="request-card">
                <p>Campagna: {request.campaign}</p>
                <p>Data: {new Date(request.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        {userRequests.approved.length > 0 && (
          <div className="request-section approved-requests">
            <h3>Richieste Approvate</h3>
            {userRequests.approved.map((request) => (
              <div key={request._id} className="request-card">
                <p>Campagna: {request.campaign}</p>
                <p>Data: {new Date(request.createdAt).toLocaleDateString()}</p>
                {request.uniqueLink && (
                  <p>Link Univoco: {API_BASE_URL + request.uniqueLink}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {userRequests.rejected.length > 0 && (
          <div className="request-section rejected-requests">
            <h3>Richieste Rifiutate</h3>
            {userRequests.rejected.map((request) => (
              <div key={request._id} className="request-card">
                <p>Campagna: {request.campaign}</p>
                <p>Data: {new Date(request.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        {Object.values(userRequests).every((list) => list.length === 0) && (
          <p>Non hai ancora effettuato richieste di campagne.</p>
        )}
      </div>

      {/* Messaggio di stato */}
      {message && (
        <div
          style={{
            color: messageType === 'success' ? 'green' : 'red',
            marginTop: '10px',
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default CampaignRequestOverview;
