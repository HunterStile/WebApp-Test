import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { Search, Filter } from 'lucide-react';
import { ConversionContext } from '../../context/ConversionContext';

const ConversionsPage = () => {
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {updateConversions} = useContext(ConversionContext);
  const [updating, setUpdating] = useState(false);
    

  // Filters state
  const [filters, setFilters] = useState({
    aff_var: '',
    status: '',
    campaign_name: '',
    type: '',
    startDate: '',
    endDate: '',
  });

  const [total, setTotal] = useState(0);

  // Fetch conversions
  const fetchConversions = async () => {
    setLoading(true);
    setError(null);

    try {
      const { aff_var, status, campaign_name, type, startDate, endDate } = filters;
      const response = await axios.get(`${API_BASE_URL}/gambling/conversions`, {
        params: { aff_var, status, campaign_name, type, startDate, endDate },
      });

      setConversions(response.data.conversions);
      setTotal(response.data.total);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      const newCount = await updateConversions();
      alert(`Aggiornamento completato. Nuove conversioni: ${newCount}`);
    } catch (err) {
      alert('Errore durante l\'aggiornamento');
    } finally {
      setUpdating(false);
    }
  };

  // Error handling
  const handleError = (err) => {
    console.error('Errore:', err);
    setError(
      err.response?.data?.message || 
      "Si è verificato un errore nel recupero delle conversioni"
    );
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      aff_var: '',
      status: '',
      campaign_name: '',
      type: '',
      startDate: '',
      endDate: '',
    });
  };

  // Initial and filter application effects
  useEffect(() => {
    fetchConversions();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestione Conversioni</h1>

      {/* Error Handling */}
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg">
          {error}
        </div>
      )}

        <button
          onClick={handleUpdate}
          disabled={updating}
          className={`
            px-4 py-2 rounded 
            ${updating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}
          `}
        >
          {updating ? 'Aggiornamento...' : 'Aggiorna Conversioni'}
        </button>

      {/* Filters Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Filtri</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Aff Var */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aff Var</label>
            <input 
              type="text"
              name="aff_var"
              value={filters.aff_var}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Filtra per Aff Var"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <input 
              type="text"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Filtra per Status"
            />
          </div>

          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Campagna</label>
            <input 
              type="text"
              name="campaign_name"
              value={filters.campaign_name}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Filtra per Nome Campagna"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <input 
              type="text"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Filtra per Tipo"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Inizio</label>
            <input 
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fine</label>
            <input 
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-4">
          <button 
            onClick={resetFilters}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Resetta Filtri
          </button>
          <button 
            onClick={fetchConversions}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center"
          >
            <Search className="w-5 h-5 mr-2" /> Applica Filtri
          </button>
        </div>
      </div>

      {/* Conversions Results */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">
            Risultati Conversioni
          </h2>
          <p className="text-gray-600">
            Totale: <span className="font-bold">{total} conversioni</span>
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-4">Caricamento...</div>
        ) : conversions.length === 0 ? (
          <p className="text-gray-500 text-center">Nessuna conversione trovata</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="text-white p-3 text-left">Utente</th>
                  <th className="text-white p-3 text-left">Campagna</th>
                  <th className="text-white p-3 text-left">Status</th>
                  <th className="text-white p-3 text-right">Importo</th>
                  <th className="text-white p-3 text-left">Data</th>
                </tr>
              </thead>
              <tbody>
                {conversions.map((conversion, index) => (
                  <tr 
                    key={index} 
                    className="border-b hover:bg-black-50 transition"
                  >
                    <td className="p-3">{conversion.aff_var}</td>
                    <td className="p-3">{conversion.campaign_name}</td>
                    <td className="p-3">
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          conversion.status === 'paid' 
                            ? 'bg-green-300 text-green-800' 
                            : conversion.status === 'validated'
                            ? 'bg-green-100 text-green-800' 
                            : conversion.status === 'refused'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {conversion.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">{conversion.commission}</td>
                    <td className="p-3">{new Date(conversion.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversionsPage;