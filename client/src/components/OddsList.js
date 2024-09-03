import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config'; // Importa l'URL di base
import './OddsList.css'; // Importa il CSS per la modale

// Mappatura dei nomi dei bookmaker con le loro chiavi
const bookmakerMapping = {
  'Unibet': 'unibet',
  'LiveScore Bet (EU)': 'livescorebeteu',
  'Marathon Bet': 'marathon_bet',
  '888sport': '888sport',
  'Pinnacle': 'pinnacle',
  'Tipico': 'tipico',
  'Nordic Bet': 'nordicbet',
  'Betsson': 'betsson',
  'Betfair': 'betfair',
  'MyBookie.ag': 'mybookieag',
  'William Hill': 'williamhill',
  'Matchbook': 'matchbook',
  'BetOnline.ag': 'betonlineag',
  'Coolbet': 'coolbet'
};

const bookmakerOptions = Object.keys(bookmakerMapping);

const OddsList = () => {
  const [odds, setOdds] = useState([]);
  const [sports, setSports] = useState([]);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [betAmount, setBetAmount] = useState(100);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState('soccer'); // Default sport
  const [selectedBookmakers, setSelectedBookmakers] = useState([]);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/odds/sports`);
        setSports(response.data);
      } catch (error) {
        setError('Error fetching sports data');
        console.error('Error fetching sports:', error);
      }
    };

    fetchSports(); // Richiama l'API degli sport all'avvio del componente
  }, []);

  useEffect(() => {
    const fetchOdds = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/odds/upcoming-odds`, {
          params: { 
            sportKey: selectedSport, 
            bookmakers: selectedBookmakers.join(',')
          }
        });
        const currentTime = new Date();
        const filteredOdds = response.data.filter(game => {
          const eventTime = new Date(game.commence_time);
          return eventTime > currentTime;
        });
        setOdds(filteredOdds);
      } catch (error) {
        setError('Error fetching odds data');
        console.error('Error fetching odds:', error);
      }
    };

    fetchOdds();
  }, [selectedSport, selectedBookmakers]); // Aggiorna gli eventi quando `selectedSport` o `selectedBookmakers` cambiano

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

  const openModal = (game, market) => {
    setModalData({
      game,
      market,
      odds1: market.outcomes[0]?.price || 0,
      oddsX: market.outcomes[2]?.price || 'N/A',
      odds2: market.outcomes[1]?.price || 0
    });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalData(null);
    setBetAmount(100);
  };

  const calculatePunta = (odds1, oddsX, odds2) => {
    const puntaX = (betAmount * odds1) / oddsX;
    const punta2 = (betAmount * odds1) / odds2;
    return { puntaX, punta2 };
  };

  const TotalBetting = (betAmount, puntaX, punta2) => {
    const totalbet = betAmount + puntaX + punta2;
    return totalbet;
  };

  const calculateRating = (profit, totalbet) => {
    const rating = (100 * 100) + (profit / totalbet) * (100 * 100);
    return (rating / 100);
  };

  const calculateProfit = (puntata1, puntataX, puntata2, quota) => {
    const totalBet = puntata1 + puntataX + puntata2;
    return (quota * puntata1) - totalBet;
  };

  const handleAmountChange = (e) => {
    setBetAmount(Number(e.target.value));
  };

  const handleOddsChange = (e, key) => {
    setModalData(prevState => ({
      ...prevState,
      [key]: Number(e.target.value)
    }));
  };

  const handleSportChange = async (sportKey) => {
    setSelectedSport(sportKey);
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    const bookmakerKey = bookmakerMapping[value];
    setSelectedBookmakers(prevState => {
      if (checked) {
        return [...prevState, bookmakerKey];
      } else {
        return prevState.filter(bookmaker => bookmaker !== bookmakerKey);
      }
    });
  };

  return (
    <div>
      <h2>Available Sports</h2>
      {error && <p>{error}</p>}
      {sports.length > 0 ? (
        <ul>
          {sports.map((sport, index) => (
            <li key={index} onClick={() => handleSportChange(sport.key)}>
              <strong>{sport.title}</strong> - {sport.description}
            </li>
          ))}
        </ul>
      ) : (
        <p>No sports available.</p>
      )}

      <h2>Filter by Bookmakers</h2>
      <div className="bookmakers-checkboxes">
        {bookmakerOptions.map((bookmaker, index) => (
          <label key={index}>
            <input
              type="checkbox"
              value={bookmaker}
              checked={selectedBookmakers.includes(bookmakerMapping[bookmaker])}
              onChange={handleCheckboxChange}
            />
            {bookmaker}
          </label>
        ))}
      </div>

      <h2>Upcoming Odds</h2>
      {error && <p>{error}</p>}
      {odds.length > 0 ? (
        <ul>
          {odds.map((game, index) => (
            <li key={index}>
              <strong>{game.sport_title}</strong> - {game.home_team} vs {game.away_team}
              <br />
              <strong>Date:</strong> {formatDate(game.commence_time)}
              <ul>
                {game.bookmakers.map((bookmaker, bIndex) => (
                  <li key={bIndex}>
                    {bookmaker.title}:
                    <ul>
                      {bookmaker.markets.map((market, mIndex) => (
                        market.key === 'h2h' && (
                          <li key={mIndex}>
                            1 (Home Win): {market.outcomes[1]?.price || 'N/A'} | 
                            X (Draw): {market.outcomes[2]?.price || 'N/A'} | 
                            2 (Away Win): {market.outcomes[0]?.price || 'N/A'}
                            <button onClick={() => openModal(game, market)}>Calcola puntate</button>
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

      {modalIsOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{modalData.game.home_team} vs {modalData.game.away_team}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <strong>Totale Giocato:</strong>
              </div>
              <div>
                {(() => {
                  const { odds1, oddsX, odds2 } = modalData;
                  const { puntaX, punta2 } = calculatePunta(odds1, oddsX, odds2);
                  const totalBet = TotalBetting(betAmount, puntaX, punta2);
                  return totalBet.toFixed(2);
                })()}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <strong>Rating:</strong>
              </div>
              <div>
                {(() => {
                  const { odds1, oddsX, odds2 } = modalData;
                  const { puntaX, punta2 } = calculatePunta(odds1, oddsX, odds2);
                  const totalBet = TotalBetting(betAmount, puntaX, punta2);
                  const profit = calculateProfit(betAmount, puntaX, punta2, odds1);
                  const rating = calculateRating(profit, totalBet);
                  return rating.toFixed(2) + '%';
                })()}
              </div>
            </div>
            <label>
              Importo puntato:
              <input 
                type="number" 
                value={betAmount} 
                onChange={handleAmountChange} 
              />
            </label>
            <div>
              <label>
                Quota 1:
                <input 
                  type="number" 
                  value={modalData.odds1} 
                  onChange={(e) => handleOddsChange(e, 'odds1')} 
                />
              </label>
            </div>
            <div>
              <label>
                Quota X:
                <input 
                  type="number" 
                  value={modalData.oddsX} 
                  onChange={(e) => handleOddsChange(e, 'oddsX')} 
                />
              </label>
            </div>
            <div>
              <label>
                Quota 2:
                <input 
                  type="number" 
                  value={modalData.odds2} 
                  onChange={(e) => handleOddsChange(e, 'odds2')} 
                />
              </label>
            </div>
            <div>
              <p>
                Punta 1: {betAmount} a quota {modalData.odds1}
                {modalData.odds1 !== 'N/A' && ` | Profitto: ${calculateProfit(betAmount, calculatePunta(modalData.odds1, modalData.oddsX, modalData.odds2).puntaX, calculatePunta(modalData.odds1, modalData.oddsX, modalData.odds2).punta2, modalData.odds1).toFixed(2)}`}
              </p>
              {modalData.oddsX !== 'N/A' && (
                <p>
                  Punta X: {calculatePunta(modalData.odds1, modalData.oddsX, modalData.odds2).puntaX.toFixed(2)} a quota {modalData.oddsX}
                  {modalData.oddsX !== 'N/A' && ` | Profitto: ${calculateProfit(calculatePunta(modalData.odds1, modalData.oddsX, modalData.odds2).puntaX, betAmount, calculatePunta(modalData.odds1, modalData.oddsX, modalData.odds2).punta2, modalData.oddsX).toFixed(2)}`}
                </p>
              )}
              <p>
                Punta 2: {calculatePunta(modalData.odds1, modalData.oddsX, modalData.odds2).punta2.toFixed(2)} a quota {modalData.odds2}
                {modalData.odds2 !== 'N/A' && ` | Profitto: ${calculateProfit(calculatePunta(modalData.odds1, modalData.oddsX, modalData.odds2).punta2, betAmount , calculatePunta(modalData.odds1, modalData.oddsX, modalData.odds2).puntaX, modalData.odds2).toFixed(2)}`}
              </p>
            </div>
            <button onClick={closeModal}>Chiudi</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OddsList;