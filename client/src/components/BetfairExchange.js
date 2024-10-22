import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config'; // Importa l'URL di base

const BetfairExchange = () => {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [odds, setOdds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Funzione di utility per gestire le chiamate API
  const fetchWithErrorHandling = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const matchesData = await fetchWithErrorHandling(`${API_BASE_URL}/matches`);
        
        // Verifica e formatta i dati ricevuti
        const matchesArray = Array.isArray(matchesData) ? matchesData : [];
        setMatches(matchesArray);
        
        if (matchesArray.length > 0) {
          setSelectedMatch(matchesArray[0]);
          const oddsData = await fetchWithErrorHandling(
            `${API_BASE_URL}/odds/${matchesArray[0].marketId}`
          );
          setOdds(oddsData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  useEffect(() => {
    if (!selectedMatch) return;

    const updateOdds = async () => {
      try {
        const data = await fetchWithErrorHandling(
          `${API_BASE_URL}/odds/${selectedMatch.marketId}`
        );
        setOdds(data);
      } catch (err) {
        console.error('Error updating odds:', err);
        // Non settiamo l'errore qui per evitare di interrompere l'UI
      }
    };

    updateOdds(); // Chiamata iniziale
    const interval = setInterval(updateOdds, 5000);
    return () => clearInterval(interval);
  }, [selectedMatch]);

  const handleMatchSelect = async (marketId) => {
    const match = matches.find(m => m.marketId === marketId);
    setSelectedMatch(match);
    try {
      const data = await fetchWithErrorHandling(`${API_BASE_URL}/odds/${marketId}`);
      setOdds(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded">
        Error: {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading Betfair data...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Match selector */}
      <div className="mb-6">
        <select 
          className="w-full p-2 border rounded"
          value={selectedMatch?.marketId || ''}
          onChange={(e) => handleMatchSelect(e.target.value)}
        >
          {matches.map(match => (
            <option key={match.marketId} value={match.marketId}>
              {match.event?.name || 'Unnamed Event'} - {
                new Date(match.event?.openDate || Date.now()).toLocaleString()
              }
            </option>
          ))}
        </select>
      </div>

      {/* Odds table */}
      {odds?.runners?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Team</th>
                <th className="p-2 border" colSpan="3">Back</th>
                <th className="p-2 border" colSpan="3">Lay</th>
              </tr>
            </thead>
            <tbody>
              {odds.runners.map(runner => (
                <tr key={runner.selectionId}>
                  <td className="p-2 border font-medium">
                    {runner.runnerName}
                  </td>
                  {/* Back odds */}
                  {runner.ex?.availableToBack?.slice(0, 3).map((back, i) => (
                    <td key={`back-${i}`} className="p-2 border text-center bg-blue-50">
                      <div className="font-bold">{back.price?.toFixed(2) || '-'}</div>
                      <div className="text-sm text-gray-600">€{back.size?.toFixed(0) || '-'}</div>
                    </td>
                  )) || (
                    <td colSpan="3" className="p-2 border text-center">No data</td>
                  )}
                  {/* Lay odds */}
                  {runner.ex?.availableToLay?.slice(0, 3).map((lay, i) => (
                    <td key={`lay-${i}`} className="p-2 border text-center bg-pink-50">
                      <div className="font-bold">{lay.price?.toFixed(2) || '-'}</div>
                      <div className="text-sm text-gray-600">€{lay.size?.toFixed(0) || '-'}</div>
                    </td>
                  )) || (
                    <td colSpan="3" className="p-2 border text-center">No data</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-4">No odds data available</div>
      )}

      {/* Last update timestamp */}
      {odds && (
        <div className="mt-4 text-sm text-gray-600">
          Last update: {new Date(odds.lastMatchTime || odds.lastUpdateTime || Date.now()).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default BetfairExchange;