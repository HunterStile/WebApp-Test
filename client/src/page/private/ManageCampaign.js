import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';

const ManageCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [name, setName] = useState('');
  const [realUrl, setRealUrl] = useState('');
  const [description, setDescription] = useState('');
  const [conditions, setConditions] = useState('');
  const [commissionPlan, setCommissionPlan] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [editCampaignId, setEditCampaignId] = useState(null);

  // Carica tutte le campagne al montaggio del componente
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/cpc/campaigns`);
        setCampaigns(response.data);
      } catch (error) {
        setMessage('Errore nel recupero delle campagne');
        setMessageType('error');
      }
    };

    fetchCampaigns();
  }, []);

  // Funzione per aggiungere o modificare una campagna
  const handleSubmit = async (e) => {
    setMessage('');
    e.preventDefault();

    if (!name || !realUrl || !description || !conditions || !commissionPlan) {
      setMessage('Tutti i campi sono richiesti');
      setMessageType('error');
      return;
    }

    try {
      if (editCampaignId) {
        // Modifica campagna
        const response = await axios.patch(`${API_BASE_URL}/admin/campaigns/${editCampaignId}`, {
          name, realUrl, description, conditions, commissionPlan
        });
        setMessage('Campagna modificata con successo');
        setMessageType('success');
      } else {
        // Aggiungi nuova campagna
        const response = await axios.post(`${API_BASE_URL}/admin/campaigns`, {
          name, realUrl, description, conditions, commissionPlan
        });
        setMessage('Campagna aggiunta con successo');
        setMessageType('success');
      }

      setName('');
      setRealUrl('');
      setDescription('');
      setConditions('');
      setCommissionPlan('');
      setEditCampaignId(null);

      // Ricarica le campagne
      const updatedCampaigns = await axios.get(`${API_BASE_URL}/cpc/campaigns`);
      setCampaigns(updatedCampaigns.data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Errore nell\'aggiunta o modifica della campagna');
      setMessageType('error');
    }
  };

  // Funzione per modificare una campagna
  const handleEdit = (campaign) => {
    setName(campaign.name);
    setRealUrl(campaign.realUrl);
    setDescription(campaign.description);
    setConditions(campaign.conditions);
    setCommissionPlan(campaign.commissionPlan);
    setEditCampaignId(campaign._id);
  };

  // Funzione per eliminare una campagna
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/admin/campaigns/${id}`);
      setMessage('Campagna eliminata con successo');
      setMessageType('success');

      // Ricarica le campagne
      const updatedCampaigns = await axios.get(`${API_BASE_URL}/admin/campaigns`);
      setCampaigns(updatedCampaigns.data);
    } catch (error) {
      setMessage('Errore nell\'eliminazione della campagna');
      setMessageType('error');
    }
  };

  return (
    <div className="manage-campaigns">
      <h2>Gestisci Campagne</h2>
      
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
        <div>
          <label>Descrizione</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Condizioni</label>
          <textarea 
            value={conditions} 
            onChange={(e) => setConditions(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Piano Commissionale</label>
          <textarea 
            value={commissionPlan} 
            onChange={(e) => setCommissionPlan(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">
          {editCampaignId ? 'Modifica Campagna' : 'Aggiungi Campagna'}
        </button>
      </form>

      {message && (
        <div style={{ color: messageType === 'success' ? 'green' : 'red' }}>
          {message}
        </div>
      )}

      <h3>Campagne Esistenti</h3>
      <table>
        <thead>
          <tr>
            <th>Nome Campagna</th>
            <th>URL Reale</th>
            <th>Descrizione</th>
            <th>Condizioni</th>
            <th>Piano Commissionale</th>
            <th>Azione</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign._id}>
              <td>{campaign.name}</td>
              <td><a href={campaign.realUrl} target="_blank" rel="noopener noreferrer">{campaign.realUrl}</a></td>
              <td>{campaign.description}</td>
              <td>{campaign.conditions}</td>
              <td>{campaign.commissionPlan}</td>
              <td>
                <button onClick={() => handleEdit(campaign)}>Modifica</button>
                <button onClick={() => handleDelete(campaign._id)}>Elimina</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageCampaigns;
