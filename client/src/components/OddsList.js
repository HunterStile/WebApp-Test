// client/src/components/OddsList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config'; // Importa l'URL di base

const OddsList = () => {
  const [odds, setOdds] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOdds = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/odds/upcoming-odds`);
        const currentTime = new Date();
        const filteredOdds = response.data.filter(game => {
          const eventTime = new Date(game.commence_time);
          return eventTime > currentTime; // Include solo eventi futuri
        });
        setOdds(filteredOdds);
      } catch (error) {
        setError('Error fetching odds data');
        console.error('Error fetching odds:', error);
      }
    };

    fetchOdds();
  }, []);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  };

  return (
    <div>
      <h2>Upcoming Odds</h2>
      {error && <p>{error}</p>}
      {odds.length > 0 ? (
        <ul>
          {odds.map((game, index) => (
            <li key={index}>
              <strong>{game.sport_title}</strong> - {game.home_team} vs {game.away_team}
              <br />
              <strong>Date:</strong> {formatDate(game.commence_time)} {/* Visualizza la data */}
              <ul>
                {game.bookmakers.map((bookmaker, bIndex) => (
                  <li key={bIndex}>
                    {bookmaker.title}:
                    <ul>
                      {bookmaker.markets.map((market, mIndex) => (
                        market.key === 'h2h' && (
                          <li key={mIndex}>
                            1 (Home Win): {market.outcomes[0].price} | 
                            X (Draw): {market.outcomes[2]?.price || 'N/A'} | 
                            2 (Away Win): {market.outcomes[1].price}
                          </li>
                        )
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p>No odds available.</p>
      )}
    </div>
  );
};

export default OddsList;
