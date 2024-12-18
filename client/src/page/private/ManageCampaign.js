import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { Trash2, Edit, Plus, X, Check } from 'lucide-react';

const ManageCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    realUrl: '',
    description: '',
    conditions: '',
    commissionPlan: '',
    status: 'attivo'
  });
  const [editCampaignId, setEditCampaignId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Fetch campaigns on component mount
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit form for adding/editing campaign
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Validate form
    const { name, realUrl, description, conditions, commissionPlan, status } = formData;
    if (!name || !realUrl || !description || !conditions || !commissionPlan || !status) {
      setMessage('Tutti i campi sono richiesti');
      setMessageType('error');
      return;
    }

    try {
      if (editCampaignId) {
        // Edit existing campaign
        await axios.patch(`${API_BASE_URL}/admin/campaigns/${editCampaignId}`, formData);
        setMessage('Campagna modificata con successo');
      } else {
        // Add new campaign
        await axios.post(`${API_BASE_URL}/admin/campaigns`, formData);
        setMessage('Campagna aggiunta con successo');
      }

      // Reset form and reload campaigns
      resetForm();
      const updatedCampaigns = await axios.get(`${API_BASE_URL}/cpc/campaigns`);
      setCampaigns(updatedCampaigns.data);
      
      setMessageType('success');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Errore nell\'operazione');
      setMessageType('error');
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      realUrl: '',
      description: '',
      conditions: '',
      commissionPlan: '',
      status: 'attivo'
    });
    setEditCampaignId(null);
  };

  // Prepare campaign for editing
  const handleEdit = (campaign) => {
    setFormData({
      name: campaign.name,
      realUrl: campaign.realUrl,
      description: campaign.description,
      conditions: campaign.conditions,
      commissionPlan: campaign.commissionPlan,
      status: campaign.status
    });
    setEditCampaignId(campaign._id);
  };

  // Delete campaign
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/admin/campaigns/${id}`);
      setMessage('Campagna eliminata con successo');
      setMessageType('success');

      // Reload campaigns
      const updatedCampaigns = await axios.get(`${API_BASE_URL}/cpc/campaigns`);
      setCampaigns(updatedCampaigns.data);
    } catch (error) {
      setMessage('Errore nell\'eliminazione della campagna');
      setMessageType('error');
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {editCampaignId ? 'Modifica Campagna' : 'Aggiungi Nuova Campagna'}
        </h2>

        {/* Status Message */}
        {message && (
          <div 
            className={`
              mb-4 p-3 rounded-md text-sm font-medium 
              ${messageType === 'success' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
              }
            `}
          >
            {message}
          </div>
        )}

        {/* Campaign Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Campagna</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Reale</label>
            <input
              type="text"
              name="realUrl"
              value={formData.realUrl}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condizioni</label>
            <textarea
              name="conditions"
              value={formData.conditions}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Piano Commissionale</label>
            <textarea
              name="commissionPlan"
              value={formData.commissionPlan}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="attivo">Attivo</option>
              <option value="disattivo">Disattivo</option>
            </select>
          </div>
          <div className="md:col-span-2 flex space-x-2">
            <button 
              type="submit" 
              className="
                flex items-center justify-center 
                px-4 py-2 bg-blue-500 text-white 
                rounded-md hover:bg-blue-600 
                transition duration-300
              "
            >
              {editCampaignId ? (
                <>
                  <Edit className="mr-2 w-5 h-5" /> Modifica Campagna
                </>
              ) : (
                <>
                  <Plus className="mr-2 w-5 h-5" /> Aggiungi Campagna
                </>
              )}
            </button>
            {editCampaignId && (
              <button 
                type="button" 
                onClick={resetForm}
                className="
                  flex items-center justify-center 
                  px-4 py-2 bg-gray-200 text-gray-700 
                  rounded-md hover:bg-gray-300 
                  transition duration-300
                "
              >
                <X className="mr-2 w-5 h-5" /> Annulla
              </button>
            )}
          </div>
        </form>

        {/* Campaigns Table */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Campagne Esistenti</h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left text-xs font-medium text-white uppercase tracking-wider">Nome</th>
                  <th className="p-3 text-left text-xs font-medium text-white uppercase tracking-wider">URL</th>
                  <th className="p-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                  <th className="p-3 text-left text-xs font-medium text-white uppercase tracking-wider">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign._id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{campaign.description}</div>
                    </td>
                    <td className="p-3">
                      <a 
                        href={campaign.realUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate max-w-xs block"
                      >
                        {campaign.realUrl}
                      </a>
                    </td>
                    <td className="p-3">
                      <span 
                        className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${campaign.status === 'attivo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                          }
                        `}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="p-3 flex space-x-2">
                      <button 
                        onClick={() => handleEdit(campaign)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Modifica"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(campaign._id)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Elimina"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {campaigns.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                Nessuna campagna presente
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCampaigns;