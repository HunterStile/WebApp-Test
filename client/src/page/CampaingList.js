import React, { useContext, useState } from 'react';
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

const RequestCampaign = () => {
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const { user } = useContext(AuthContext);

  // Stato locale per i messaggi
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' o 'error'

  const handleRequestCampaign = async () => {
    try {
      // Usa lo username invece dell'ID
      const response = await axios.post(`${API_BASE_URL}/cpc/campaign-requests`, {
        campaign: selectedCampaign,
        username: user, // Assumendo che user.username sia disponibile
      });
  
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

  return (
    <div>
      <select 
        value={selectedCampaign} 
        onChange={(e) => setSelectedCampaign(e.target.value)}
      >
        {campaigns.map(campaign => (
          <option key={campaign.name} value={campaign.name}>
            {campaign.name}
          </option>
        ))}
      </select>
      <button onClick={handleRequestCampaign}>
        Richiedi Campagna
      </button>

      {/* Mostra il messaggio */}
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


export default RequestCampaign;
