import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';

const ConversionsPage = () => {
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Stati per i filtri
  const [filters, setFilters] = useState({
    aff_var: '',
    status: '',
    campaign_name: '',
    type: '',
    startDate: '',
    endDate: '',
  });

  const [total, setTotal] = useState(0);

  // Funzione per inviare i filtri e ottenere le conversioni
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
      setError('Errore nel recupero delle conversioni');
    } finally {
      setLoading(false);
    }
  };

  // Funzione per gestire i cambiamenti nei filtri
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Funzione per applicare il filtro
  const applyFilters = () => {
    fetchConversions();
  };

  // Chiamata per caricare le conversioni iniziali
  useEffect(() => {
    fetchConversions();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Conversioni</h1>

      {/* Filtro */}
      <div>
        <h2>Filtri</h2>
        <div>
          <label>
            Aff Var:
            <input
              type="text"
              name="aff_var"
              value={filters.aff_var}
              onChange={handleFilterChange}
            />
          </label>
        </div>
        <div>
          <label>
            Status:
            <input
              type="text"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            />
          </label>
        </div>
        <div>
          <label>
            Campaign Name:
            <input
              type="text"
              name="campaign_name"
              value={filters.campaign_name}
              onChange={handleFilterChange}
            />
          </label>
        </div>
        <div>
          <label>
            Type:
            <input
              type="text"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            />
          </label>
        </div>
        <div>
          <label>
            Start Date:
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </label>
        </div>
        <div>
          <label>
            End Date:
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </label>
        </div>

        <button onClick={applyFilters}>Applica Filtro</button>
      </div>

      {/* Risultati */}
      <div>
        <h2>Risultati</h2>
        <p>Total: {total} conversioni</p>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Campaign</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {conversions.map((conversion, index) => (
              <tr key={index}>
                <td>{conversion.aff_var}</td>
                <td>{conversion.campaign_name}</td>
                <td>{conversion.status}</td>
                <td>{conversion.commission}</td>
                <td>{new Date(conversion.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConversionsPage;
