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
  const [selectedSport, setSelectedSport] = useState('soccer'); // Default sport
  const [selectedBookmakers, setSelectedBookmakers] = useState([]);
  const [cachedOdds, setCachedOdds] = useState({});
  const [competitionTitle, setCompetitionTitle] = useState("Upcoming Odds");
  const [arbitrageModalData, setArbitrageModalData] = useState(null);

  // State to track expanded descriptions
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  //FETCH DELLE SCOMESSE
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

  //GESTIONE RICERCA PARTITE
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

  
  //ODDSMATCHER functions
  const calculateArbitrage = (stake, commission, bookmakerOdds, betfairOdds) => {
    const effectiveBetfairOdds = betfairOdds - commission;
    const lay = (bookmakerOdds / effectiveBetfairOdds) * stake;
    const liability = (lay * betfairOdds) - lay;
    const profit = (bookmakerOdds - 1) * stake - (betfairOdds - 1) * lay;
    const rating = (profit / stake) * 100;

    return {
      lay: parseFloat(lay.toFixed(2)),
      liability: parseFloat(liability.toFixed(2)),
      profit: parseFloat(profit.toFixed(2)),
      rating: parseFloat(rating.toFixed(2))
    };
  };

  // Funzione per ordinare gli eventi per rating
  const calculateEventRating = (game) => {
    let bestRating = -Infinity;

    game.bookmakers.forEach(bookmaker => {
      if (bookmaker.title !== 'Betfair') {
        const betfairBookmaker = game.bookmakers.find(b => b.title === 'Betfair');
        if (betfairBookmaker) {
          bookmaker.markets.forEach((market, index) => {
            if (market.key === 'h2h') {
              market.outcomes.forEach((outcome, i) => {
                const betfairOdds = betfairBookmaker.markets[index].outcomes[i].price;
                const { rating } = calculateArbitrage(100, 0.05, outcome.price, betfairOdds);
                if (rating > bestRating) {
                  bestRating = rating;
                }
              });
            }
          });
        }
      }
    });

    return bestRating;
  };

  const getFilteredOdds = () => {
    if (!selectedBookmakers.length) return odds;

    const filteredGames = odds
      .map(game => ({
        ...game,
        bookmakers: game.bookmakers.filter(bookmaker =>
          selectedBookmakers.includes(bookmakerMapping[bookmaker.title])
        ),
        rating: calculateEventRating(game)
      }))
      .filter(game => game.bookmakers.length > 0)
      .sort((a, b) => b.rating - a.rating); // Ordina per rating decrescente

    return filteredGames;
  };

  const filteredOdds = getFilteredOdds();

  // Componente per la nuova modale
  const ArbitrageModal = ({
    isOpen,
    onClose,
    game,
    bookmakerOdds,
    betfairOdds,
    marketType, // '1', 'X', o '2'
    teamNames
  }) => {
    const [stake, setStake] = useState(100);
    const [commission, setCommission] = useState(0.05);
    const [customBookmakerOdds, setCustomBookmakerOdds] = useState(bookmakerOdds);
    const [customBetfairOdds, setCustomBetfairOdds] = useState(betfairOdds);

    const calculations = calculateArbitrage(
      stake,
      commission,
      customBookmakerOdds,
      customBetfairOdds
    );

    if (!isOpen) return null;

    return (
      <div className="modal-odds">
        <div className="modal-content">
          <div className="modal-header">
            <h3>{teamNames.home} vs {teamNames.away}</h3>
            <div className="market-type">
              Mercato: {marketType === '1' ? 'Home' : marketType === 'X' ? 'Draw' : 'Away'}
            </div>
          </div>

          <div className="input-section">
            <div className="input-group">
              <label>
                Puntata (€):
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
                  className="form-input"
                />
              </label>
            </div>

            <div className="input-group">
              <label>
                Commissione Betfair:
                <input
                  type="number"
                  value={commission}
                  step="0.01"
                  onChange={(e) => setCommission(parseFloat(e.target.value) || 0)}
                  className="form-input"
                />
              </label>
            </div>

            <div className="input-group">
              <label>
                Quota Bookmaker:
                <input
                  type="number"
                  value={customBookmakerOdds}
                  step="0.01"
                  onChange={(e) => setCustomBookmakerOdds(parseFloat(e.target.value) || 0)}
                  className="form-input"
                />
              </label>
            </div>

            <div className="input-group">
              <label>
                Quota Betfair:
                <input
                  type="number"
                  value={customBetfairOdds}
                  step="0.01"
                  onChange={(e) => setCustomBetfairOdds(parseFloat(e.target.value) || 0)}
                  className="form-input"
                />
              </label>
            </div>
          </div>

          <div className="results-section">
            <div className="result-row">
              <span>Bancata:</span>
              <strong>€{calculations.lay}</strong>
            </div>
            <div className="result-row">
              <span>Responsabilità:</span>
              <strong>€{calculations.liability}</strong>
            </div>
            <div className="result-row">
              <span>Profit:</span>
              <strong className={calculations.profit > 0 ? 'profit-positive' : 'profit-negative'}>
                €{calculations.profit}
              </strong>
            </div>
            <div className="result-row">
              <span>Rating:</span>
              <strong className={calculations.rating > 0 ? 'rating-positive' : 'rating-negative'}>
                {calculations.rating}%
              </strong>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              Chiudi
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Nuova funzione per aprire la modale dell'arbitraggio
  const openArbitrageModal = (game, market, outcome, index) => {
    const betfairBookmaker = game.bookmakers.find(b => b.title === 'Betfair');
    if (!betfairBookmaker) {
      alert('Quote Betfair non disponibili per questo evento');
      return;
    }

    const betfairMarket = betfairBookmaker.markets.find(m => m.key === market.key);
    if (!betfairMarket) {
      alert('Mercato non disponibile su Betfair');
      return;
    }

    setArbitrageModalData({
      game,
      bookmakerOdds: outcome.price,
      betfairOdds: betfairMarket.outcomes[index].price,
      marketType: index === 0 ? '1' : index === 1 ? '2' : 'X',
      teamNames: {
        home: game.home_team,
        away: game.away_team
      }
    });
  };

  //MAIN PAGE//
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
                      {bookmaker.markets.map((market, mIndex) => (
                        market.key === 'h2h' && (
                          <div key={mIndex} className="odds-grid">
                            <div className="odds-row">
                              <div className="odds-values">
                                {market.outcomes.map((outcome, index) => (
                                  <div key={index} className="odd-value-container">
                                    <span className="odd-label">
                                      {index === 0 ? '1' : index === 2 ? 'X' : '2'}:
                                    </span>
                                    <button
                                      className="odd-button"
                                      onClick={() => openArbitrageModal(game, market, outcome, index)}
                                      disabled={bookmaker.title === 'Betfair'}
                                    >
                                      {outcome.price || 'N/A'}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      ))}
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

      {/* Aggiunta della nuova modale */}
      {arbitrageModalData && (
        <ArbitrageModal
          isOpen={!!arbitrageModalData}
          onClose={() => setArbitrageModalData(null)}
          {...arbitrageModalData}
        />
      )}
    </div>
  );
};

export default OddsList;