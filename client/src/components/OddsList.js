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
        setOdds(response.data);
      } catch (error) {
        setError('Error fetching odds data');
        console.error('Error fetching odds:', error);
      }
    };

    fetchOdds();
  }, []);

  return (
    <div>
      <h2>Upcoming Odds</h2>
      {error && <p>{error}</p>}
      {odds.length > 0 ? (
        <ul>
          {odds.map((game, index) => (
            <li key={index}>
              {game.sport_title} - {game.home_team} vs {game.away_team}
              <ul>
                {game.bookmakers.map((bookmaker, bIndex) => (
                  <li key={bIndex}>
                    {bookmaker.title}:
                    <ul>
                      {bookmaker.markets.map((market, mIndex) => (
                        <li key={mIndex}>
                          {market.key} - Home: {market.outcomes[0].price} | Away: {market.outcomes[1].price}
                        </li>
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
