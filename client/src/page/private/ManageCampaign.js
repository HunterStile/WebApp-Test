import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';

const AddCampaign = () => {
  const [name, setName] = useState('');
  const [realUrl, setRealUrl] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !realUrl) {
      setMessage('Nome e URL della campagna sono richiesti');
      setMessageType('error');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/campaigns`, { name, realUrl });
      setMessage(response.data.message);
      setMessageType('success');
      setName('');
      setRealUrl('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Errore nell\'aggiunta della campagna');
      setMessageType('error');
    }
  };

  return (
    <div className="add-campaign">
      <h2>Aggiungi Nuova Campagna</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome Campagna</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>URL Reale</label>
          <input 
            type="text" 
            value={realUrl} 
            onChange={(e) => setRealUrl(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Aggiungi Campagna</button>
      </form>

      {message && (
        <div style={{ color: messageType === 'success' ? 'green' : 'red' }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default AddCampaign;
