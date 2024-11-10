import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config'; // Importa l'URL di base
import './OddsList.css'; // Importa il CSS per la modale
import { ChevronDown, Search, X } from 'lucide-react';

// VARIABILI
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
const DEFAULT_RATING_RANGE = { min: 0, max: 200 };
// Default del filtro quote
const DEFAULT_ODDS_RANGE = { min: 1.01, max: 1000 };
// Max partite per pagina
const ITEMS_PER_PAGE = 10;

// INZIO COMPONENTE
const OddsList = () => {
  const [odds, setOdds] = useState([]);
  const [error, setError] = useState(null);
  const [selectedBookmakers, setSelectedBookmakers] = useState(DEFAULT_BOOKMAKERS);
  const [cachedOdds, setCachedOdds] = useState({});
  const [arbitrageModalData, setArbitrageModalData] = useState(null);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  //FETCH DELLE SCOMESSE
  const fetchOdds = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/odds/major-leagues`);
      const currentTime = new Date();
      const filteredOdds = response.data.filter(game => {
        const eventTime = new Date(game.commence_time);
        return eventTime > currentTime;
      });

      setOdds(filteredOdds);
      setCachedOdds(filteredOdds); // Ora la cache è un array semplice invece di un oggetto
    } catch (error) {
      setError('Error fetching odds data');
      console.error('Error fetching odds:', error);
    }
  }, []);

  // Funzione per ottenere le quote della pagina corrente
  const getCurrentPageOdds = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredOdds.slice(startIndex, endIndex);
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
      // Applica il filtro di ricerca
      if (searchTerm) {
        const matchString = `${game.home_team} vs ${game.away_team}`.toLowerCase();
        if (!matchString.includes(searchTerm.toLowerCase())) {
          return [];
        }
      }

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
      </div>
    );
  };

  const RatingRangeFilter = () => {
    const [localRatingRange, setLocalRatingRange] = useState(ratingRange);

    const handleRangeChange = (e) => {
      const { name, value } = e.target;
      const newRange = {
        ...localRatingRange,
        [name]: parseFloat(value)
      };
      setLocalRatingRange(newRange);

      // Aggiorna immediatamente per gli slider
      if (e.target.type === 'range') {
        setRatingRange(newRange);
      }
    };

    // handleBlur solo per gli input numerici
    const handleBlur = (e) => {
      if (e.target.type === 'number') {
        setRatingRange(localRatingRange);
      }
    };

    const resetRatingRange = () => {
      const defaultRange = {
        min: DEFAULT_RATING_RANGE.min,
        max: DEFAULT_RATING_RANGE.max
      };
      setLocalRatingRange(defaultRange);
      setRatingRange(defaultRange);
    };

    return (
      <div className="rating-filter">
        <h3>Filter by Rating Range</h3>
        <div className="rating-inputs">
          <div className="rating-slider-group">
            <label>Minimum Rating: {localRatingRange.min}%</label>
            <input
              type="range"
              name="min"
              min={DEFAULT_RATING_RANGE.min}
              max={DEFAULT_RATING_RANGE.max}
              value={localRatingRange.min}
              onChange={handleRangeChange}
              className="rating-slider"
            />
          </div>

          <div className="rating-slider-group">
            <label>Maximum Rating: {localRatingRange.max}%</label>
            <input
              type="range"
              name="max"
              min={DEFAULT_RATING_RANGE.min}
              max={DEFAULT_RATING_RANGE.max}
              value={localRatingRange.max}
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
                value={localRatingRange.min}
                onChange={handleRangeChange}
                onBlur={handleBlur}
                min={DEFAULT_RATING_RANGE.min}
                max={localRatingRange.max}
                step="0.1"
              />
            </div>
            <div className="rating-input-group">
              <label>Max:</label>
              <input
                type="number"
                name="max"
                value={localRatingRange.max}
                onChange={handleRangeChange}
                onBlur={handleBlur}
                min={localRatingRange.min}
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
      </div>
    );
  };

  const OddsRangeFilter = () => {
    const [localOddsRange, setLocalOddsRange] = useState(oddsRange);

    const handleRangeChange = (e) => {
      const { name, value } = e.target;
      const newRange = {
        ...localOddsRange,
        [name]: parseFloat(value)
      };
      setLocalOddsRange(newRange);

      // Aggiorna immediatamente per gli slider
      if (e.target.type === 'range') {
        setOddsRange(newRange);
      }
    };

    // handleBlur solo per gli input numerici
    const handleBlur = (e) => {
      if (e.target.type === 'number') {
        setOddsRange(localOddsRange);
      }
    };

    const resetOddsRange = () => {
      const defaultRange = {
        min: DEFAULT_ODDS_RANGE.min,
        max: DEFAULT_ODDS_RANGE.max
      };
      setLocalOddsRange(defaultRange);
      setOddsRange(defaultRange);
    };

    return (
      <div className="odds-filter">
        <h3>Filter by Odds Range</h3>
        <div className="odds-inputs">
          <div className="odds-slider-group">
            <label>Minimum Odds: {localOddsRange.min}</label>
            <input
              type="range"
              name="min"
              min={DEFAULT_ODDS_RANGE.min}
              max={10}
              step="0.01"
              value={localOddsRange.min}
              onChange={handleRangeChange}
              className="odds-slider"
            />
          </div>

          <div className="odds-slider-group">
            <label>Maximum Odds: {localOddsRange.max}</label>
            <input
              type="range"
              name="max"
              min={localOddsRange.min}
              max={20}
              step="0.01"
              value={Math.min(localOddsRange.max, 20)}
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
                value={localOddsRange.min}
                onChange={handleRangeChange}
                onBlur={handleBlur}
                min={DEFAULT_ODDS_RANGE.min}
                max={localOddsRange.max}
                step="0.01"
              />
            </div>
            <div className="odds-input-group">
              <label>Max:</label>
              <input
                type="number"
                name="max"
                value={localOddsRange.max}
                onChange={handleRangeChange}
                onBlur={handleBlur}
                min={localOddsRange.min}
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

  // Funzione per ottenere tutte le partite uniche dal dataset
  const getUniqueMatches = () => {
    return Array.from(new Set(odds.map(game => `${game.home_team} vs ${game.away_team}`)));
  };

  // Componente SearchFilter
  const SearchFilter = () => {
    const handleSearchChange = (e) => {
      const value = e.target.value;
      setSearchTerm(value);

      if (value.trim()) {
        const matchSuggestions = getUniqueMatches().filter(match =>
          match.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(matchSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const handleSuggestionClick = (suggestion) => {
      setSearchTerm(suggestion);
      setShowSuggestions(false);
    };

    const clearSearch = () => {
      setSearchTerm('');
      setSuggestions([]);
      setShowSuggestions(false);
    };

    return (
      <div className="search-filter">
        <h3>Search Matches!</h3>
        <div className="search-input-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search for matches..."
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={clearSearch}>
              <X size={20} />
            </button>
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-container">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
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

  useEffect(() => {
    if (cachedOdds.length > 0) {
      setOdds(cachedOdds);
    } else {
      fetchOdds();
    }
  }, [cachedOdds, fetchOdds]);

  // Calcola il totale delle pagine quando filteredOdds cambia
  useEffect(() => {
    setTotalPages(Math.ceil(filteredOdds.length / ITEMS_PER_PAGE));
  }, [filteredOdds]);

  //MAIN PAGE//
  return (
    <div className="container-odds">
      {/* Sezione Quote */}
      <div className="upcoming-odds">
        <h2>ODDSMATCHER</h2>
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
        <SearchFilter />
        <h2>Elenco Partite</h2>
        {error && <p className="error-message">{error}</p>}

        {/* Lista delle Quote in formato tabella */}
        {filteredOdds.length > 0 ? (
          <>
            <table className="odds-table">
              <thead>
                <tr>
                  <th>Data e Ora</th>
                  <th>Partita</th>
                  <th>Tipo</th>
                  <th>Rating</th>
                  <th>Calcolatore</th>
                  <th>Bookmaker</th>
                  <th>Quota</th>
                  <th>Exchange</th>
                  <th>Quota Exchange</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentPageOdds().map((game, index) => (
                  <tr key={index}>
                    <td>{formatDate(game.commence_time)}</td>
                    <td>
                      <div className="match-info">
                        <span className="league-name">
                          {getLeagueName(game.league)}
                        </span>
                        <span className="team-names">
                          {game.home_team} vs {game.away_team}
                        </span>
                      </div>
                    </td>
                    <td>{game.selectedOutcome.type}</td>
                    <td>{game.selectedOutcome.rating.toFixed(2)}%</td>
                    <td>
                      <button
                        className="calculator-btn"
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
                        Calcola
                      </button>
                    </td>
                    <td>{game.selectedOutcome.bookmaker}</td>
                    <td className="odds-value">{game.selectedOutcome.odds}</td>
                    <td>Betfair</td>
                    <td className="exchange-odds">{game.selectedOutcome.betfairOdds}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Controlli Paginazione */}
            <div className="pagination-controls">
              <div className="pagination-info">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredOdds.length)} of {filteredOdds.length} matches
              </div>
              <div className="pagination-buttons">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                >
                  First
                </button>
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  Previous
                </button>

                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(pageNum => {
                      return (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        Math.abs(pageNum - currentPage) <= 1
                      );
                    })
                    .map((pageNum, index, array) => (
                      <React.Fragment key={pageNum}>
                        {index > 0 && array[index - 1] !== pageNum - 1 && (
                          <span className="pagination-ellipsis">...</span>
                        )}
                        <button
                          className={`pagination-number ${pageNum === currentPage ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next
                </button>
                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  Last
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="no-data">No odds available.</p>
        )}
      </div>

      {/* Modal per l'arbitraggio */}
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