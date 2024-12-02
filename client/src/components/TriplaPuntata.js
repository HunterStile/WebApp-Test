import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config'; // Importa l'URL di base
import './OddsList.css'; // Importa il CSS per la modale

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
  const [cachedOdds, setCachedOdds] = useState({});
  const [competitionTitle, setCompetitionTitle] = useState("Upcoming Odds");

  // State to track expanded descriptions
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const fetchSports = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/odds/sports`);
      setSports(response.data);
    } catch (error) {
      setError('Error fetching sports data');
      console.error('Error fetching sports:', error);
    }
  }, []);

  const fetchOdds = useCallback(async (sportKey) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/odds/upcoming-odds`, {
        params: { sportKey }
      });
      const currentTime = new Date();
      const filteredOdds = response.data.filter(game => {
        const eventTime = new Date(game.commence_time);
        return eventTime > currentTime;
      });
      setCachedOdds(prevState => ({
        ...prevState,
        [sportKey]: filteredOdds
      }));
      setOdds(filteredOdds);
    } catch (error) {
      setError('Error fetching odds data');
      console.error('Error fetching odds:', error);
    }
  }, []);

  useEffect(() => {
    fetchSports(); // Richiama l'API degli sport all'avvio del componente
  }, [fetchSports]);

  useEffect(() => {
    if (cachedOdds[selectedSport]) {
      // Usa i dati già in cache
      setOdds(cachedOdds[selectedSport]);
    } else {
      // Fetch data if not in cache
      fetchOdds(selectedSport);
    }
  }, [selectedSport, cachedOdds, fetchOdds]);

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

  const getFilteredOdds = () => {
    if (!selectedBookmakers.length) return odds;
    return odds.map(game => ({
      ...game,
      bookmakers: game.bookmakers.filter(bookmaker =>
        selectedBookmakers.includes(bookmakerMapping[bookmaker.title])
      )
    })).filter(game => game.bookmakers.length > 0);
  };

  const filteredOdds = getFilteredOdds();

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

  const handleSportChange = (sportKey, sport) => {
    setSelectedSport(sportKey);
    setCompetitionTitle(sport.title);
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      // Seleziona tutti i bookmaker
      setSelectedBookmakers(Object.values(bookmakerMapping));
    } else {
      // Deseleziona tutti i bookmaker
      setSelectedBookmakers([]);
    }
  };

  // Group sports by description
  const groupedSports = sports.reduce((acc, sport) => {
    if (!acc[sport.description]) {
      acc[sport.description] = [];
    }
    acc[sport.description].push(sport);
    return acc;
  }, {});

  const toggleDescription = (description) => {
    setExpandedDescriptions(prevState => ({
      ...prevState,
      [description]: !prevState[description]
    }));
  };

  return (
    <div className="container-odds">
      {/* Sezione Sport Disponibili */}
      <div className="available-sports">
        <h2>Available Sports</h2>
        {error && <p className="error-message">{error}</p>}
        {Object.keys(groupedSports).length > 0 ? (
          <div>
            {Object.entries(groupedSports).map(([description, sports]) => (
              <div key={description} className="sports-category">
                <h3 onClick={() => toggleDescription(description)}>
                  <span>{description}</span>
                  <span>{expandedDescriptions[description] ? '▲' : '▼'}</span>
                </h3>
                {expandedDescriptions[description] && (
                  <ul className="sports-list">
                    {sports.map((sport) => (
                      <li
                        key={sport.key}
                        onClick={() => handleSportChange(sport.key, sport)}
                        className="sport-item"
                      >
                        <strong>{sport.title}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No sports available.</p>
        )}
      </div>

      {/* Sezione Quote Imminenti */}
      <div className="upcoming-odds">
        {/* Sezione Filtri Bookmaker */}
        <div className="bookmakers-section">
          <h2>Filter by Bookmakers</h2>
          <div className="bookmakers-checkboxes">
            <label className="bookmaker-checkbox">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedBookmakers.length === Object.values(bookmakerMapping).length}
              />
              <span>Seleziona/Deseleziona Tutto</span>
            </label>
            {bookmakerOptions.map((bookmaker, index) => (
              <label key={index} className="bookmaker-checkbox">
                <input
                  type="checkbox"
                  value={bookmaker}
                  checked={selectedBookmakers.includes(bookmakerMapping[bookmaker])}
                  onChange={handleCheckboxChange}
                />
                <span>{bookmaker}</span>
              </label>
            ))}
          </div>
        </div>

        <h2>{competitionTitle}</h2>
        {error && <p className="error-message">{error}</p>}

        {/* Lista delle Quote */}
        {filteredOdds.length > 0 ? (
          <div className="games-list">
            {filteredOdds.map((game, index) => (
              <div key={index} className="game-card">
                <div className="game-header">
                  <div className="game-teams">
                    <strong>{game.sport_title}</strong>
                    <span> - {game.home_team} vs {game.away_team}</span>
                  </div>
                  <div className="game-date">
                    {formatDate(game.commence_time)}
                  </div>
                </div>

                <div className="bookmakers-list">
                  {game.bookmakers.map((bookmaker, bIndex) => (
                    <div key={bIndex} className="bookmaker-odds">
                      <h4>{bookmaker.title}</h4>
                      <div className="odds-grid">
                        {bookmaker.markets.map((market, mIndex) => (
                          market.key === 'h2h' && (
                            <div key={mIndex} className="odds-row">
                              <div className="odds-values">
                                <span> 1: {market.outcomes[0]?.price || 'N/A'}</span>
                                <span> X: {market.outcomes[2]?.price || 'N/A'}</span>
                                <span> 2: {market.outcomes[1]?.price || 'N/A'}</span>
                              </div>
                              <button
                                className="btn btn-primary"
                                onClick={() => openModal(game, market)}
                              >
                                Calcola puntate
                              </button>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No odds available.</p>
        )}
      </div>

      {/* Modal per il Calcolo delle Puntate */}
      {modalIsOpen && (
        <div className="modal-odds">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modalData.game.home_team} vs {modalData.game.away_team}</h3>
            </div>

            <div className="modal-row">
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

            <div className="modal-row">
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

            <div className="input-group">
              <label>
                Importo puntato:
                <input
                  type="number"
                  value={betAmount}
                  onChange={handleAmountChange}
                  className="form-input"
                />
              </label>
            </div>

            <div className="input-group">
              <label>
                Quota 1:
                <input
                  type="number"
                  value={modalData.odds1}
                  onChange={(e) => handleOddsChange(e, 'odds1')}
                  className="form-input"
                />
              </label>
            </div>

            <div className="input-group">
              <label>
                Quota X:
                <input
                  type="number"
                  value={modalData.oddsX}
                  onChange={(e) => handleOddsChange(e, 'oddsX')}
                  className="form-input"
                />
              </label>
            </div>

            <div className="input-group">
              <label>
                Quota 2:
                <input
                  type="number"
                  value={modalData.odds2}
                  onChange={(e) => handleOddsChange(e, 'odds2')}
                  className="form-input"
                />
              </label>
            </div>

            <div className="betting-summary">
              <div className="bet-info">
                <p>
                  Punta 1: {betAmount} a quota {modalData.odds1}
                  {modalData.odds1 !== 'N/A' &&
                    ` | Profitto: ${calculateProfit(
                      betAmount,
                      calculatePunta(modalData.odds1, modalData.oddsX, modalData.odds2).puntaX,
                      calculatePunta(modalData.odds1, modalData.oddsX, modalData.odds2).punta2,
                      modalData.odds1
                    ).toFixed(2)}`
                  }
                </p>
                {modalData.oddsX !== 'N/A' && (
                  <p>
                    Punta X: {calculatePunta(modalData.odds1, modalData.oddsX, modalData.odds2).puntaX.toFixed(2)} a quota {modalData.oddsX}
                    {modalData.oddsX !== 'N/A' &&
                      ` | Profitto: ${calculateProfit(
                        calculatePunta(modalData.odds1, modalData.oddsX, modalData.odds2).puntaX,
                        betAmount,
                        calculatePunta(modalData.odds1, modalData.oddsX, modalData.odds2).punta2,
                        modalData.oddsX
                      ).toFixed(2)}`
                    }
                  </p>
                )}
                <p>
                  Punta 2: {calculatePunta(modalData.odds1, modalData.oddsX, modalData.odds2).punta2.toFixed(2)} a quota {modalData.odds2}
                  {modalData.odds2 !== 'N/A' &&
                    ` | Profitto: ${calculateProfit(
                      calculatePunta(modalData.odds1, modalData.oddsX, modalData.odds2).punta2,
                      betAmount,
                      calculatePunta(modalData.odds1, modalData.oddsX, modalData.odds2).puntaX,
                      modalData.odds2
                    ).toFixed(2)}`
                  }
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeModal}>
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OddsList;