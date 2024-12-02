import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config'; // Importa l'URL di base
import './OddsList.css'; // Importa il CSS per la modale
import { ChevronDown, Search, X } from 'lucide-react';
import Modal from 'react-modal';

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
      <div className="w-full">
        <h3 className="text-sm text-slate-400 mb-2">Filter by Date Range</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-slate-300"
              >
                From:
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateRange.startDate}
                min={today}
                max={dateRange.endDate || undefined}
                onChange={handleDateChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         placeholder-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-slate-300"
              >
                To:
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateRange.endDate}
                min={dateRange.startDate || today}
                onChange={handleDateChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         placeholder-slate-400"
              />
            </div>
          </div>

          {(dateRange.startDate || dateRange.endDate) && (
            <button
              onClick={clearDates}
              className="inline-flex items-center px-3 py-2 text-sm rounded-lg
                       bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Clear Dates
            </button>
          )}

          {!isDateRangeValid() && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500 rounded-lg p-2">
              End date must be after start date
            </div>
          )}
        </div>
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
      <div className="w-full">
        <h3 className="text-sm text-slate-400 mb-2">Filter by Rating Range</h3>
        <div className="space-y-4">
          {/* Slider per il minimo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Minimum Rating: <span className="text-cyan-400">{localRatingRange.min}%</span>
            </label>
            <input
              type="range"
              name="min"
              min={DEFAULT_RATING_RANGE.min}
              max={DEFAULT_RATING_RANGE.max}
              value={localRatingRange.min}
              onChange={handleRangeChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-4
                       [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-purple-500
                       [&::-webkit-slider-thumb]:hover:bg-purple-400
                       [&::-moz-range-thumb]:w-4
                       [&::-moz-range-thumb]:h-4
                       [&::-moz-range-thumb]:rounded-full
                       [&::-moz-range-thumb]:bg-purple-500
                       [&::-moz-range-thumb]:hover:bg-purple-400
                       [&::-moz-range-thumb]:border-0"
            />
          </div>
    
          {/* Slider per il massimo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Maximum Rating: <span className="text-cyan-400">{localRatingRange.max}%</span>
            </label>
            <input
              type="range"
              name="max"
              min={DEFAULT_RATING_RANGE.min}
              max={DEFAULT_RATING_RANGE.max}
              value={localRatingRange.max}
              onChange={handleRangeChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-4
                       [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-purple-500
                       [&::-webkit-slider-thumb]:hover:bg-purple-400
                       [&::-moz-range-thumb]:w-4
                       [&::-moz-range-thumb]:h-4
                       [&::-moz-range-thumb]:rounded-full
                       [&::-moz-range-thumb]:bg-purple-500
                       [&::-moz-range-thumb]:hover:bg-purple-400
                       [&::-moz-range-thumb]:border-0"
            />
          </div>
    
          {/* Input numerici */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Min:</label>
              <input
                type="number"
                name="min"
                value={localRatingRange.min}
                onChange={handleRangeChange}
                onBlur={handleBlur}
                min={DEFAULT_RATING_RANGE.min}
                max={localRatingRange.max}
                step="0.1"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         placeholder-slate-400"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Max:</label>
              <input
                type="number"
                name="max"
                value={localRatingRange.max}
                onChange={handleRangeChange}
                onBlur={handleBlur}
                min={localRatingRange.min}
                max={DEFAULT_RATING_RANGE.max}
                step="0.1"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         placeholder-slate-400"
              />
            </div>
          </div>
    
          {/* Pulsante Reset */}
          <button
            onClick={resetRatingRange}
            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 
                     rounded-lg transition-colors duration-200 
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
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
      <div className="w-full">
        <h3 className="text-sm text-slate-400 mb-2">Filter by Odds Range</h3>
        <div className="space-y-4">
          {/* Slider Quota Minima */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Minimum Odds: <span className="text-pink-400">{localOddsRange.min}</span>
            </label>
            <input
              type="range"
              name="min"
              min={DEFAULT_ODDS_RANGE.min}
              max={10}
              step="0.01"
              value={localOddsRange.min}
              onChange={handleRangeChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-4
                       [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-purple-500
                       [&::-webkit-slider-thumb]:hover:bg-purple-400
                       [&::-moz-range-thumb]:w-4
                       [&::-moz-range-thumb]:h-4
                       [&::-moz-range-thumb]:rounded-full
                       [&::-moz-range-thumb]:bg-purple-500
                       [&::-moz-range-thumb]:hover:bg-purple-400
                       [&::-moz-range-thumb]:border-0
                       focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
    
          {/* Slider Quota Massima */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Maximum Odds: <span className="text-pink-400">{localOddsRange.max}</span>
            </label>
            <input
              type="range"
              name="max"
              min={localOddsRange.min}
              max={20}
              step="0.01"
              value={Math.min(localOddsRange.max, 20)}
              onChange={handleRangeChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-4
                       [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-purple-500
                       [&::-webkit-slider-thumb]:hover:bg-purple-400
                       [&::-moz-range-thumb]:w-4
                       [&::-moz-range-thumb]:h-4
                       [&::-moz-range-thumb]:rounded-full
                       [&::-moz-range-thumb]:bg-purple-500
                       [&::-moz-range-thumb]:hover:bg-purple-400
                       [&::-moz-range-thumb]:border-0
                       focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
    
          {/* Input numerici */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Min:</label>
              <input
                type="number"
                name="min"
                value={localOddsRange.min}
                onChange={handleRangeChange}
                onBlur={handleBlur}
                min={DEFAULT_ODDS_RANGE.min}
                max={localOddsRange.max}
                step="0.01"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         placeholder-slate-400"
              />
            </div>
    
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Max:</label>
              <input
                type="number"
                name="max"
                value={localOddsRange.max}
                onChange={handleRangeChange}
                onBlur={handleBlur}
                min={localOddsRange.min}
                max={DEFAULT_ODDS_RANGE.max}
                step="0.01"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         placeholder-slate-400"
              />
            </div>
          </div>
    
          {/* Pulsante Reset */}
          <button
            onClick={resetOddsRange}
            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 
                     rounded-lg transition-colors duration-200 
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
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
      <div className="w-full">
        <h3 className="text-sm text-slate-400 mb-2">Filter by Bookmakers</h3>
        <div className="space-y-4">
          {/* Regular Bookmakers Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-300">
                Bookmakers ({selectedRegular.length})
              </h3>
            </div>
            
            <div 
              className="w-full p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors duration-200"
              onClick={() => setIsBookmakersOpen(!isBookmakersOpen)}
            >
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    onChange={handleSelectAllRegular}
                    checked={selectedRegular.length === Object.values(regularMapping).length}
                    className="w-4 h-4 rounded border-slate-500 text-purple-500 focus:ring-purple-500/50 bg-slate-600"
                  />
                  <span className="text-sm text-slate-300">Select/Deselect All</span>
                </label>
                <ChevronDown 
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isBookmakersOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>
  
            {isBookmakersOpen && (
              <div className="mt-2 space-y-2 p-3 bg-slate-800 rounded-lg border border-slate-700">
                {regularBookmakers.map((bookmaker, index) => (
                  <label key={index} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={bookmaker}
                      checked={selectedBookmakers.includes(regularMapping[bookmaker])}
                      onChange={handleRegularBookmakerChange}
                      className="w-4 h-4 rounded border-slate-500 text-purple-500 focus:ring-purple-500/50 bg-slate-600"
                    />
                    <span className="text-sm text-slate-300">{bookmaker}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
  
          {/* Exchange Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-300">
                Exchange ({selectedExchange.length})
              </h3>
            </div>
            
            <div 
              className="w-full p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors duration-200"
              onClick={() => setIsExchangeOpen(!isExchangeOpen)}
            >
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    onChange={handleSelectAllExchange}
                    checked={selectedExchange.length === Object.values(exchangeMapping).length}
                    className="w-4 h-4 rounded border-slate-500 text-purple-500 focus:ring-purple-500/50 bg-slate-600"
                  />
                  <span className="text-sm text-slate-300">Select/Deselect All</span>
                </label>
                <ChevronDown 
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isExchangeOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>
  
            {isExchangeOpen && (
              <div className="mt-2 space-y-2 p-3 bg-slate-800 rounded-lg border border-slate-700">
                {exchangeOptions.map((bookmaker, index) => (
                  <label key={index} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={bookmaker}
                      checked={selectedBookmakers.includes(exchangeMapping[bookmaker])}
                      onChange={handleExchangeChange}
                      className="w-4 h-4 rounded border-slate-500 text-purple-500 focus:ring-purple-500/50 bg-slate-600"
                    />
                    <span className="text-sm text-slate-300">{bookmaker}</span>
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
  
    // Custom styles for the modal
    const customStyles = {
      content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#1e293b', // slate-800
        color: 'white',
        borderRadius: '0.5rem',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%'
      },
      overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 1000
      }
    };
  
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        style={customStyles}
        contentLabel="Arbitrage Calculation"
      >
        <div className="modal-header mb-4">
          <h3 className="text-2xl font-bold mb-2">{teamNames.home} vs {teamNames.away}</h3>
          <div className="market-type text-sm text-slate-400">
            Mercato: {marketType === '1' ? 'Home' : marketType === 'X' ? 'Draw' : 'Away'}
          </div>
        </div>
  
        <div className="input-section grid gap-4 mb-4">
          <div className="input-group">
            <label className="block mb-2">
              Puntata (€):
              <input
                type="number"
                value={stake}
                onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-700 rounded-lg mt-1"
              />
            </label>
          </div>
  
          <div className="input-group">
            <label className="block mb-2">
              Commissione Betfair:
              <input
                type="number"
                value={commission}
                step="0.01"
                onChange={(e) => setCommission(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-700 rounded-lg mt-1"
              />
            </label>
          </div>
  
          <div className="input-group">
            <label className="block mb-2">
              Quota Bookmaker:
              <input
                type="number"
                value={customBookmakerOdds}
                step="0.01"
                onChange={(e) => setCustomBookmakerOdds(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-700 rounded-lg mt-1"
              />
            </label>
          </div>
  
          <div className="input-group">
            <label className="block mb-2">
              Quota Betfair:
              <input
                type="number"
                value={customBetfairOdds}
                step="0.01"
                onChange={(e) => setCustomBetfairOdds(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-700 rounded-lg mt-1"
              />
            </label>
          </div>
        </div>
  
        <div className="results-section space-y-2 mb-4">
          <div className="result-row flex justify-between">
            <span>Bancata:</span>
            <strong>€{calculations.lay}</strong>
          </div>
          <div className="result-row flex justify-between">
            <span>Responsabilità:</span>
            <strong>€{calculations.liability}</strong>
          </div>
          <div className="result-row flex justify-between">
            <span>Profit:</span>
            <strong className={calculations.profit > 0 ? 'text-green-400' : 'text-red-400'}>
              €{calculations.profit}
            </strong>
          </div>
          <div className="result-row flex justify-between">
            <span>Rating:</span>
            <strong className={calculations.rating > 0 ? 'text-green-400' : 'text-red-400'}>
              {calculations.rating}%
            </strong>
          </div>
        </div>
  
        <div className="modal-actions flex justify-end">
          <button 
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg"
            onClick={onClose}
          >
            Chiudi
          </button>
        </div>
      </Modal>
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
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-purple-400 mb-4">ODDSMATCHER</h2>

          {/* Filters Section */}
          <div className="bg-slate-800 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="mt-4">
              <SearchFilter />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Odds Table */}
          {filteredOdds.length > 0 ? (
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="p-4 text-left text-sm text-slate-400">Data e Ora</th>
                      <th className="p-4 text-left text-sm text-slate-400">Partita</th>
                      <th className="p-4 text-left text-sm text-slate-400">Tipo</th>
                      <th className="p-4 text-left text-sm text-slate-400">Rating</th>
                      <th className="p-4 text-left text-sm text-slate-400">Calcolatore</th>
                      <th className="p-4 text-left text-sm text-slate-400">Bookmaker</th>
                      <th className="p-4 text-left text-sm text-slate-400">Quota</th>
                      <th className="p-4 text-left text-sm text-slate-400">Exchange</th>
                      <th className="p-4 text-left text-sm text-slate-400">Quota Exchange</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {getCurrentPageOdds().map((game, index) => (
                      <tr key={index} className="hover:bg-slate-700/50">
                        <td className="p-4">{formatDate(game.commence_time)}</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-slate-400">{getLeagueName(game.league)}</span>
                            <span className="font-medium">{game.home_team} vs {game.away_team}</span>
                          </div>
                        </td>
                        <td className="p-4">{game.selectedOutcome.type}</td>
                        <td className="p-4 text-cyan-400">{game.selectedOutcome.rating.toFixed(2)}%</td>
                        <td className="p-4">
                          <button
                            onClick={() => {
                              const market = game.bookmakers
                                .find(b => b.title === game.selectedOutcome.bookmaker)
                                ?.markets.find(m => m.key === 'h2h');
                              const outcome = market?.outcomes[
                                game.selectedOutcome.type === '1' ? 0 :
                                  game.selectedOutcome.type === '2' ? 1 : 2
                              ];
                              if (market && outcome) {
                                openArbitrageModal(game, market, outcome,
                                  game.selectedOutcome.type === '1' ? 0 :
                                    game.selectedOutcome.type === '2' ? 1 : 2
                                );
                              }
                            }}
                            className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg text-sm"
                          >
                            Calcola
                          </button>
                        </td>
                        <td className="p-4">{game.selectedOutcome.bookmaker}</td>
                        <td className="p-4 text-green-400">{game.selectedOutcome.odds}</td>
                        <td className="p-4">Betfair</td>
                        <td className="p-4 text-pink-400">{game.selectedOutcome.betfairOdds}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-slate-400">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredOdds.length)} of {filteredOdds.length} matches
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                  >
                    First
                  </button>
                  <button
                    className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
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
                            <span className="text-slate-400">...</span>
                          )}
                          <button
                            className={`px-4 py-2 rounded-lg ${pageNum === currentPage
                              ? 'bg-purple-500'
                              : 'bg-slate-700 hover:bg-slate-600'
                              }`}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>

                  <button
                    className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    Next
                  </button>
                  <button
                    className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-lg p-8 text-center text-slate-400">
              No odds available.
            </div>
          )}
        </div>

        {/* Arbitrage Modal */}
        {arbitrageModalData && (
          <ArbitrageModal
            isOpen={!!arbitrageModalData}
            onClose={() => setArbitrageModalData(null)}
            {...arbitrageModalData}
          />
        )}
      </div>
    </div>
  );
};

export default OddsList;