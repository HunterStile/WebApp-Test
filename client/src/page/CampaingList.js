import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config';
import axios from 'axios';

const campaigns = [
  {
    name: 'BETANO',
    url: 'https://www.gambling-affiliation.com/cpc/v=g5MTrVQ96U0IQlw1NeFO-hIm1W43ZmVn0.gSTfMxo2s_GA7331V2&aff_var_1=',
  },
  {
    name: 'ROLLETTO',
    url: 'https://www.gambling-affiliation.com/cpc/v=CDv-VvGTatah4ZD6IPtEqcDZjnem9BRZ3z2oz1PDuhg_GA7331V2&aff_var_1=',
  },
  {
    name: 'TIKIAKA',
    url: 'https://www.gambling-affiliation.com/cpc/v=WD9KR0uuFFaj9029..91PF4Kwbtu9Re0s6ZO6fobNIk_GA7331V2&aff_var_1=',
  },
  {
    name: 'CAZEURS',
    url: 'https://www.gambling-affiliation.com/cpc/v=Xb75XCL1vA3pLoGQnEc6OtsmD1AFzUlVf2Rm5zd.DwM_GA7331V2&aff_var_1=',
  },
];

const CampaignRequestOverview = () => {
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [userRequests, setUserRequests] = useState({
    pending: [],
    approved: [],
    rejected: []
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const { user } = useContext(AuthContext);

  // Fetch user requests when component mounts or user changes
  useEffect(() => {
    const fetchUserRequests = async () => {
      if (!user) return;

      try {
        const response = await axios.get(`${API_BASE_URL}/cpc/user-requests`, {
          params: { username: user }
        });

        // Categorizza correttamente le richieste
        const categorizedRequests = {
          pending: response.data.pendingRequests || [],
          approved: response.data.approvedRequests || [],
          rejected: response.data.rejectedRequests || []
        };

        setUserRequests(categorizedRequests);
      } catch (error) {
        console.error('Errore nel recupero delle richieste:', error);
        setMessage(
          error.response?.data?.message || 
          "Errore nel recupero delle richieste"
        );
        setMessageType('error');
      }
    };

    fetchUserRequests();
  }, [user]);

  const handleRequestCampaign = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cpc/campaign-requests`, {
        campaign: selectedCampaign,
        username: user,
      });

      // Aggiorna lo stato locale aggiungendo la nuova richiesta pending
      setUserRequests(prev => ({
        ...prev,
        pending: [...prev.pending, response.data]
      }));

      setMessage('Richiesta campagna inviata');
      setMessageType('success');
    } catch (error) {
      console.error('Errore nella richiesta:', error.response ? error.response.data : error.message);
      
      setMessage(
        error.response?.data?.message || 
        "Errore nell'invio della richiesta"
      );
      setMessageType('error');
    }
  };

  // Render richieste in base allo stato
  const renderRequestsList = (requests, title, statusClass) => (
    requests.length > 0 && (
      <div className={`request-section ${statusClass}`}>
        <h3>{title}</h3>
        {requests.map(request => (
          <div key={request._id} className="request-card">
            <p>Campagna: {request.campaign}</p>
            <p>Data: {new Date(request.createdAt).toLocaleDateString()}</p>
            {request.uniqueLink && (
              <div>
                <p>Link Univoco: {API_BASE_URL + request.uniqueLink}</p>
                {request.realRedirectUrl && (
                  <p>URL Redirect: {request.realRedirectUrl}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  );

  return (
    <div className="campaign-request-overview">
      <h1>Gestione Campagne</h1>

      {/* Sezione Richiesta Nuova Campagna */}
      <div className="new-campaign-request">
        <h2>Richiedi Nuova Campagna</h2>
        <select 
          value={selectedCampaign} 
          onChange={(e) => setSelectedCampaign(e.target.value)}
        >
          <option value="">Seleziona Campagna</option>
          {campaigns.map(campaign => (
            <option key={campaign.name} value={campaign.name}>
              {campaign.name}
            </option>
          ))}
        </select>
        <button 
          onClick={handleRequestCampaign}
          disabled={!selectedCampaign}
        >
          Richiedi Campagna
        </button>
      </div>

      {/* Sezione Riepilogo Richieste */}
      <div className="requests-summary">
        <h2>Le Tue Richieste</h2>
        
        {renderRequestsList(userRequests.pending, 'Richieste in Attesa', 'pending-requests')}
        {renderRequestsList(userRequests.approved, 'Richieste Approvate', 'approved-requests')}
        {renderRequestsList(userRequests.rejected, 'Richieste Rifiutate', 'rejected-requests')}
        
        {/* Messaggio se non ci sono richieste */}
        {Object.values(userRequests).every(list => list.length === 0) && (
          <p>Non hai ancora effettuato richieste di campagne.</p>
        )}
      </div>

      {/* Messaggio di stato */}
      {message && (
        <div 
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

export default CampaignRequestOverview;