import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config'; // Importa l'URL di base
import './OddsList.css'; // Importa il CSS per la modale
import { ChevronDown } from 'lucide-react';

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
  'Coolbet': 'coolbet',
  'Betclic': 'betclic',
};

// Utility function per ottenere il nome leggibile del campionato
const getLeagueName = (leagueKey) => {
  const leagueNames = {
    'soccer_italy_serie_a': 'Serie A',
    'soccer_germany_bundesliga': 'Bundesliga',
    'soccer_france_ligue_one': 'Ligue 1',
    'soccer_england_league1': 'Premier League',
    'soccer_spain_la_liga': 'La Liga'
  };
  return leagueNames[leagueKey] || leagueKey;
};

const bookmakerOptions = Object.keys(bookmakerMapping);

// Default selected bookmakers
const DEFAULT_BOOKMAKERS = ['betfair', '888sport'];
// Defaul rating 
const DEFAULT_RATING_RANGE = { min: 0, max: 200 }; // Rating può superare 100% in alcuni casi
// Prima aggiungi il nuovo state per il range delle quote
const DEFAULT_ODDS_RANGE = { min: 1.01, max: 1000 }; // Quote tipiche vanno da 1.01 a valori molto alti

const OddsList = () => {
  const [odds, setOdds] = useState([]);
  const [sports, setSports] = useState([]);
  const [error, setError] = useState(null);
  const [selectedSport, setSelectedSport] = useState('soccer'); // Default sport
  const [selectedBookmakers, setSelectedBookmakers] = useState(DEFAULT_BOOKMAKERS);
  const [cachedOdds, setCachedOdds] = useState({});
  const [competitionTitle, setCompetitionTitle] = useState("Upcoming Odds");
  const [arbitrageModalData, setArbitrageModalData] = useState(null);
  const [viewMode, setViewMode] = useState('major');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [ratingRange, setRatingRange] = useState({
    min: DEFAULT_RATING_RANGE.min,
    max: DEFAULT_RATING_RANGE.max
  });
  const [oddsRange, setOddsRange] = useState({
    min: DEFAULT_ODDS_RANGE.min,
    max: DEFAULT_ODDS_RANGE.max
  });

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
      if (viewMode === 'major') {
        const response = await axios.get(`${API_BASE_URL}/odds/major-leagues`);
        const currentTime = new Date();
        const filteredOdds = response.data.filter(game => {
          const eventTime = new Date(game.commence_time);
          return eventTime > currentTime;
        });
        setOdds(filteredOdds);
        setCachedOdds(prevState => ({
          ...prevState,
          majorLeagues: filteredOdds
        }));
      } else {
        const currentTime = new Date();
        const response = await axios.get(`${API_BASE_URL}/odds/upcoming-odds`, {
          params: { sportKey }
        });
        const filteredOdds = response.data.filter(game => {
          const eventTime = new Date(game.commence_time);
          return eventTime > currentTime;
        });
        setOdds(filteredOdds);
        setCachedOdds(prevState => ({
          ...prevState,
          [sportKey]: filteredOdds
        }));
      }
    } catch (error) {
      setError('Error fetching odds data');
      console.error('Error fetching odds:', error);
    }
  }, [viewMode]);

  useEffect(() => {
    fetchSports(); // Richiama l'API degli sport all'avvio del componente
  }, [fetchSports]);

  useEffect(() => {
    if (viewMode === 'major') {
      if (cachedOdds.majorLeagues) {
        setOdds(cachedOdds.majorLeagues);
      } else {
        fetchOdds();
      }
    } else if (cachedOdds[selectedSport]) {
      setOdds(cachedOdds[selectedSport]);
    } else {
      fetchOdds(selectedSport);
    }
  }, [selectedSport, viewMode, cachedOdds, fetchOdds]);

  // Aggiungi il componente per il toggle della vista
  const ViewToggle = () => (
    <div className="view-toggle">
      <button
        className={`toggle-btn ${viewMode === 'major' ? 'active' : ''}`}
        onClick={() => setViewMode('major')}
      >
        Major Leagues
      </button>
      <button
        className={`toggle-btn ${viewMode === 'upcoming' ? 'active' : ''}`}
        onClick={() => setViewMode('upcoming')}
      >
        Upcoming Events
      </button>
    </div>
  );

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

  // ODDSMATCHER FUNCTIONS //

  //Funzione per calcolare l'arbitraggio
  const calculateArbitrage = (stake, commission, bookmakerOdds, betfairOdds) => {
    const effectiveBetfairOdds = betfairOdds - commission;
    const lay = (bookmakerOdds / effectiveBetfairOdds) * stake;
    const liability = (lay * betfairOdds) - lay;
    const profit = (bookmakerOdds - 1) * stake - (betfairOdds - 1) * lay;
    const rating = 100 + (profit / stake) * 100;

    return {
      lay: parseFloat(lay.toFixed(2)),
      liability: parseFloat(liability.toFixed(2)),
      profit: parseFloat(profit.toFixed(2)),
      rating: parseFloat(rating.toFixed(2))
    };
  };

  // Funzione per calcolare il rating di ogni singola quota
  const calculateSingleOddRating = (bookmakerOdd, betfairOdd, stake = 100, commission = 0.05) => {
    const { rating } = calculateArbitrage(stake, commission, bookmakerOdd, betfairOdd);
    return rating;
  };

  // Funzione per ottenere tutte le quote con i loro rating
  const getOddsWithRatings = (game) => {
    const ratedOdds = [];

    const betfairBookmaker = game.bookmakers.find(b => b.title === 'Betfair');
    if (!betfairBookmaker) return ratedOdds;

    game.bookmakers.forEach(bookmaker => {
      if (bookmaker.title !== 'Betfair') {
        bookmaker.markets.forEach((market, marketIndex) => {
          if (market.key === 'h2h') {
            market.outcomes.forEach((outcome, outcomeIndex) => {
              const betfairOdd = betfairBookmaker.markets[marketIndex].outcomes[outcomeIndex].price;
              const rating = calculateSingleOddRating(outcome.price, betfairOdd);

              ratedOdds.push({
                ...game,
                selectedOutcome: {
                  type: outcomeIndex === 0 ? '1' : outcomeIndex === 2 ? 'X' : '2',
                  bookmaker: bookmaker.title,
                  odds: outcome.price,
                  betfairOdds: betfairOdd,
                  rating: rating
                }
              });
            });
          }
        });
      }
    });

    return ratedOdds;
  };

  // APPLICAZIONE DEI FILTRI //
  const getFilteredOdds = () => {
    if (!selectedBookmakers.length) return [];

    const allRatedOdds = odds.flatMap(game => {
      if (dateRange.startDate || dateRange.endDate) {
        const eventDate = new Date(game.commence_time);

        if (dateRange.startDate) {
          const startDate = new Date(dateRange.startDate);
          startDate.setHours(0, 0, 0, 0);
          if (eventDate < startDate) return [];
        }

        if (dateRange.endDate) {
          const endDate = new Date(dateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (eventDate > endDate) return [];
        }
      }

      const filteredGame = {
        ...game,
        bookmakers: game.bookmakers.filter(bookmaker =>
          selectedBookmakers.includes(bookmakerMapping[bookmaker.title])
        )
      };

      return getOddsWithRatings(filteredGame);
    });

    return allRatedOdds
      .filter(game =>
        game.selectedOutcome.rating >= ratingRange.min &&
        game.selectedOutcome.rating <= ratingRange.max &&
        game.selectedOutcome.odds >= oddsRange.min &&
        game.selectedOutcome.odds <= oddsRange.max
      )
      .sort((a, b) => b.selectedOutcome.rating - a.selectedOutcome.rating);
  };

  const filteredOdds = getFilteredOdds();

  // Add date range filter component
  const DateRangeFilter = () => {
    const today = new Date().toISOString().split('T')[0];

    const handleDateChange = (e) => {
      const { name, value } = e.target;
      setDateRange(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const clearDates = () => {
      setDateRange({
        startDate: '',
        endDate: ''
      });
    };

    const isDateRangeValid = () => {
      if (!dateRange.startDate || !dateRange.endDate) return true;
      return new Date(dateRange.startDate) <= new Date(dateRange.endDate);
    };

    return (
      <div className="date-filter">
        <h3>Filter by Date Range</h3>
        <div className="date-range-inputs">
          <div className="date-input-group">
            <label htmlFor="startDate">From:</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              min={today}
              max={dateRange.endDate || undefined}
              onChange={handleDateChange}
            />
          </div>

          <div className="date-input-group">
            <label htmlFor="endDate">To:</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              min={dateRange.startDate || today}
              onChange={handleDateChange}
            />
          </div>

          {(dateRange.startDate || dateRange.endDate) && (
            <button
              className="clear-date-btn"
              onClick={clearDates}
            >
              Clear Dates
            </button>
          )}
        </div>

        {!isDateRangeValid() && (
          <div className="date-error">
            End date must be after start date
          </div>
        )}

        {/* Optional: Add quick select buttons */}
        <div className="quick-select-dates">
          <button
            onClick={() => {
              const today = new Date();
              const nextWeek = new Date();
              nextWeek.setDate(today.getDate() + 7);

              setDateRange({
                startDate: today.toISOString().split('T')[0],
                endDate: nextWeek.toISOString().split('T')[0]
              });
            }}
          >
            Next 7 Days
          </button>

          <button
            onClick={() => {
              const today = new Date();
              const nextMonth = new Date();
              nextMonth.setMonth(today.getMonth() + 1);

              setDateRange({
                startDate: today.toISOString().split('T')[0],
                endDate: nextMonth.toISOString().split('T')[0]
              });
            }}
          >
            Next 30 Days
          </button>
        </div>
      </div>
    );
  };

  // Add Rating Range Filter component
  const RatingRangeFilter = () => {
    const handleRangeChange = (e) => {
      const { name, value } = e.target;
      setRatingRange(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }));
    };

    const resetRatingRange = () => {
      setRatingRange({
        min: DEFAULT_RATING_RANGE.min,
        max: DEFAULT_RATING_RANGE.max
      });
    };

    return (
      <div className="rating-filter">
        <h3>Filter by Rating Range</h3>
        <div className="rating-inputs">
          <div className="rating-slider-group">
            <label>Minimum Rating: {ratingRange.min}%</label>
            <input
              type="range"
              name="min"
              min={DEFAULT_RATING_RANGE.min}
              max={DEFAULT_RATING_RANGE.max}
              value={ratingRange.min}
              onChange={handleRangeChange}
              className="rating-slider"
            />
          </div>

          <div className="rating-slider-group">
            <label>Maximum Rating: {ratingRange.max}%</label>
            <input
              type="range"
              name="max"
              min={DEFAULT_RATING_RANGE.min}
              max={DEFAULT_RATING_RANGE.max}
              value={ratingRange.max}
              onChange={handleRangeChange}
              className="rating-slider"
            />
          </div>

          <div className="rating-inputs-numeric">
            <div className="rating-input-group">
              <label>Min:</label>
              <input
                type="number"
                name="min"
                value={ratingRange.min}
                onChange={handleRangeChange}
                min={DEFAULT_RATING_RANGE.min}
                max={ratingRange.max}
                step="0.1"
              />
            </div>
            <div className="rating-input-group">
              <label>Max:</label>
              <input
                type="number"
                name="max"
                value={ratingRange.max}
                onChange={handleRangeChange}
                min={ratingRange.min}
                max={DEFAULT_RATING_RANGE.max}
                step="0.1"
              />
            </div>
          </div>

          <button
            className="reset-filters-btn"
            onClick={resetRatingRange}
          >
            Reset Rating Range
          </button>
        </div>

        {/* Quick select buttons for common rating ranges */}
        <div className="quick-select-ratings">
          <button
            onClick={() => setRatingRange({ min: 95, max: 200 })}
          >
            High Value (95%+)
          </button>
          <button
            onClick={() => setRatingRange({ min: 90, max: 95 })}
          >
            Medium Value (90-95%)
          </button>
          <button
            onClick={() => setRatingRange({ min: 0, max: 90 })}
          >
            Low Value (&lt;90%)
          </button>
        </div>
      </div>
    );
  };

  // Componente per il filtro delle quote
  const OddsRangeFilter = () => {
    const handleRangeChange = (e) => {
      const { name, value } = e.target;
      setOddsRange(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }));
    };

    const resetOddsRange = () => {
      setOddsRange({
        min: DEFAULT_ODDS_RANGE.min,
        max: DEFAULT_ODDS_RANGE.max
      });
    };

    return (
      <div className="odds-filter">
        <h3>Filter by Odds Range</h3>
        <div className="odds-inputs">
          <div className="odds-slider-group">
            <label>Minimum Odds: {oddsRange.min}</label>
            <input
              type="range"
              name="min"
              min={DEFAULT_ODDS_RANGE.min}
              max={10} // Limitiamo lo slider a 10 per una migliore usabilità
              step="0.01"
              value={oddsRange.min}
              onChange={handleRangeChange}
              className="odds-slider"
            />
          </div>

          <div className="odds-slider-group">
            <label>Maximum Odds: {oddsRange.max}</label>
            <input
              type="range"
              name="max"
              min={oddsRange.min}
              max={20} // Limitiamo lo slider a 20 per una migliore usabilità
              step="0.01"
              value={Math.min(oddsRange.max, 20)}
              onChange={handleRangeChange}
              className="odds-slider"
            />
          </div>

          <div className="odds-inputs-numeric">
            <div className="odds-input-group">
              <label>Min:</label>
              <input
                type="number"
                name="min"
                value={oddsRange.min}
                onChange={handleRangeChange}
                min={DEFAULT_ODDS_RANGE.min}
                max={oddsRange.max}
                step="0.01"
              />
            </div>
            <div className="odds-input-group">
              <label>Max:</label>
              <input
                type="number"
                name="max"
                value={oddsRange.max}
                onChange={handleRangeChange}
                min={oddsRange.min}
                max={DEFAULT_ODDS_RANGE.max}
                step="0.01"
              />
            </div>
          </div>

          <button
            className="reset-filters-btn"
            onClick={resetOddsRange}
          >
            Reset Odds Range
          </button>
        </div>

        <div className="quick-select-odds">
          <button
            onClick={() => setOddsRange({ min: 1.01, max: 2 })}
          >
            Low Odds (1.01-2.00)
          </button>
          <button
            onClick={() => setOddsRange({ min: 2, max: 5 })}
          >
            Medium Odds (2.00-5.00)
          </button>
          <button
            onClick={() => setOddsRange({ min: 5, max: 1000 })}
          >
            High Odds (5.00+)
          </button>
        </div>
      </div>
    );
  };

  const BookmakersFilter = ({ 
    selectedBookmakers, 
    setSelectedBookmakers, 
    bookmakerMapping, 
    bookmakerOptions 
  }) => {
    const [isBookmakersOpen, setIsBookmakersOpen] = useState(false);
    const [isExchangeOpen, setIsExchangeOpen] = useState(false);
  
    // Separa i bookmaker tra normali ed exchange
    const exchangeOptions = bookmakerOptions.filter(book => 
      book.toLowerCase().includes('betfair')
    );
    const regularBookmakers = bookmakerOptions.filter(book => 
      !book.toLowerCase().includes('betfair')
    );
  
    // Crea mapping separati
    const exchangeMapping = Object.fromEntries(
      Object.entries(bookmakerMapping).filter(([key]) => 
        key.toLowerCase().includes('betfair')
      )
    );
    const regularMapping = Object.fromEntries(
      Object.entries(bookmakerMapping).filter(([key]) => 
        !key.toLowerCase().includes('betfair')
      )
    );
  
    // Filtra le selezioni correnti
    const selectedExchange = selectedBookmakers.filter(book => 
      Object.values(exchangeMapping).includes(book)
    );
    const selectedRegular = selectedBookmakers.filter(book => 
      Object.values(regularMapping).includes(book)
    );
  
    const handleRegularBookmakerChange = (e) => {
      const { value, checked } = e.target;
      const bookmakerKey = regularMapping[value];
      setSelectedBookmakers(prevState => {
        if (checked) {
          return [...prevState, bookmakerKey];
        } else {
          return prevState.filter(bookmaker => bookmaker !== bookmakerKey);
        }
      });
    };
  
    const handleExchangeChange = (e) => {
      const { value, checked } = e.target;
      const bookmakerKey = exchangeMapping[value];
      setSelectedBookmakers(prevState => {
        if (checked) {
          return [...prevState, bookmakerKey];
        } else {
          return prevState.filter(bookmaker => bookmaker !== bookmakerKey);
        }
      });
    };
  
    const handleSelectAllRegular = (e) => {
      const isChecked = e.target.checked;
      if (isChecked) {
        setSelectedBookmakers(prev => [
          ...prev.filter(book => Object.values(exchangeMapping).includes(book)),
          ...Object.values(regularMapping)
        ]);
      } else {
        setSelectedBookmakers(prev => 
          prev.filter(book => Object.values(exchangeMapping).includes(book))
        );
      }
    };
  
    const handleSelectAllExchange = (e) => {
      const isChecked = e.target.checked;
      if (isChecked) {
        setSelectedBookmakers(prev => [
          ...prev.filter(book => Object.values(regularMapping).includes(book)),
          ...Object.values(exchangeMapping)
        ]);
      } else {
        setSelectedBookmakers(prev => 
          prev.filter(book => Object.values(regularMapping).includes(book))
        );
      }
    };
  
    return (
      <div className="bookmakers-filter">
        <div className="bookmakers-content">
          {/* Regular Bookmakers Select */}
          <div className="bookmakers-section">
            <h3 className="bookmakers-title">Bookmakers ({selectedRegular.length})</h3>
            <div 
              className="select-all-button"
              onClick={() => setIsBookmakersOpen(!isBookmakersOpen)}
            >
              <label className="bookmaker-checkbox">
                <input
                  type="checkbox"
                  onChange={handleSelectAllRegular}
                  checked={selectedRegular.length === Object.values(regularMapping).length}
                />
                <span>Select/Deselect All</span>
              </label>
              <ChevronDown className={`chevron-icon ${isBookmakersOpen ? 'rotate' : ''}`} />
            </div>
            
            {isBookmakersOpen && (
              <div className="dropdown-menu">
                {regularBookmakers.map((bookmaker, index) => (
                  <label key={index} className="bookmaker-checkbox">
                    <input
                      type="checkbox"
                      value={bookmaker}
                      checked={selectedBookmakers.includes(regularMapping[bookmaker])}
                      onChange={handleRegularBookmakerChange}
                    />
                    <span>{bookmaker}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
  
          {/* Exchange Select */}
          <div className="bookmakers-section">
            <h3 className="bookmakers-title">Exchange ({selectedExchange.length})</h3>
            <div 
              className="select-all-button"
              onClick={() => setIsExchangeOpen(!isExchangeOpen)}
            >
              <label className="bookmaker-checkbox">
                <input
                  type="checkbox"
                  onChange={handleSelectAllExchange}
                  checked={selectedExchange.length === Object.values(exchangeMapping).length}
                />
                <span>Select/Deselect All</span>
              </label>
              <ChevronDown className={`chevron-icon ${isExchangeOpen ? 'rotate' : ''}`} />
            </div>
            
            {isExchangeOpen && (
              <div className="dropdown-menu">
                {exchangeOptions.map((bookmaker, index) => (
                  <label key={index} className="bookmaker-checkbox">
                    <input
                      type="checkbox"
                      value={bookmaker}
                      checked={selectedBookmakers.includes(exchangeMapping[bookmaker])}
                      onChange={handleExchangeChange}
                    />
                    <span>{bookmaker}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  

  // Modale di arbitraggio
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

  //Funzione per aprire la modale dell'arbitraggio
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
      {/* Sezione Quote */}
      <div className="upcoming-odds">
        <h2>ODDSMATCHER</h2>
        <ViewToggle />
        {/* Group all filters together */}
        <div className="filters-container">
          <DateRangeFilter />
          <RatingRangeFilter />
          <OddsRangeFilter />
          <BookmakersFilter
            selectedBookmakers={selectedBookmakers}
            setSelectedBookmakers={setSelectedBookmakers}
            bookmakerMapping={bookmakerMapping}
            bookmakerOptions={bookmakerOptions}
          />
        </div>
        
        <h2>{viewMode === 'major' ? 'Major League' : competitionTitle}</h2>
        {error && <p className="error-message">{error}</p>}

        {/* Lista delle Quote */}
        {filteredOdds.length > 0 ? (
          <div className="games-list">
            {filteredOdds.map((game, index) => (
              <div key={index} className="game-card">
                <div className="game-header">
                  <div className="game-teams">
                    <strong>{viewMode === 'major' ? getLeagueName(game.league) : game.sport_title}</strong>
                    <span> - {game.home_team} vs {game.away_team}</span>
                  </div>
                  <div className="game-date">
                    {formatDate(game.commence_time)}
                  </div>
                  <div className="outcome-rating">
                    Rating: {game.selectedOutcome.rating.toFixed(2)}%
                  </div>
                </div>

                <div className="bookmaker-odds-single">
                  <h4>{game.selectedOutcome.bookmaker}</h4>
                  <div className="odds-grid">
                    <div className="odds-row">
                      <div className="odds-values">
                        <div className="odd-value-container">
                          <span className="odd-label">
                            {game.selectedOutcome.type}:
                          </span>
                          <button
                            className="odd-button"
                            onClick={() => {
                              const market = game.bookmakers
                                .find(b => b.title === game.selectedOutcome.bookmaker)
                                ?.markets.find(m => m.key === 'h2h');
                              const outcome = market?.outcomes[
                                game.selectedOutcome.type === '1' ? 0 :
                                  game.selectedOutcome.type === '2' ? 1 : 2
                              ];
                              if (market && outcome) {
                                openArbitrageModal(
                                  game,
                                  market,
                                  outcome,
                                  game.selectedOutcome.type === '1' ? 0 :
                                    game.selectedOutcome.type === '2' ? 1 : 2
                                );
                              }
                            }}
                          >
                            {game.selectedOutcome.odds}
                          </button>
                          <span className="betfair-odd">
                            (Betfair: {game.selectedOutcome.betfairOdds})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
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