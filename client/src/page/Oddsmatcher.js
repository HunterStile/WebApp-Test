//components/Oddsmatcher.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config'; // Importa l'URL di base
import {Search, X } from 'lucide-react';
import Modal from 'react-modal';
import DateRangeFilter from '../components/filters/DateRangeFilter';
import RatingRangeFilter from '../components/filters/RatingRangeFilter';
import OddsRangeFilter from '../components/filters/OddsRangeFilter';
import BookmakersFilter from '../components/filters/BookmakersFilter';
import Table from '../components/Table';
import SearchFilter from '../components/filters/SearchFilter';

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
    let filteredGames = odds;

    // Apply search filter
    if (searchTerm) {
        filteredGames = filteredGames.filter(game =>
            `${game.home_team} vs ${game.away_team}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );
    }

    if (!selectedBookmakers.length) return filteredGames;

    filteredGames = filteredGames.flatMap(game => {
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

    return filteredGames
      .filter(game =>
        game.selectedOutcome.rating >= ratingRange.min &&
        game.selectedOutcome.rating <= ratingRange.max &&
        game.selectedOutcome.odds >= oddsRange.min &&
        game.selectedOutcome.odds <= oddsRange.max
      )
      .sort((a, b) => b.selectedOutcome.rating - a.selectedOutcome.rating);
  };

  const filteredOdds = getFilteredOdds();

  // Funzione per ottenere tutte le partite uniche dal dataset
  const getUniqueMatches = () => {
    return Array.from(new Set(odds.map(game => `${game.home_team} vs ${game.away_team}`)));
  };

  // Componente SearchFilter
  const SearchFilterComponent = () => {
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

  
  // Definizione delle colonne per OddsMatcher
  const oddsMatcherColumns = [
    {
      header: "Data e Ora",
      accessor: "commence_time",
      render: (game) => formatDate(game.commence_time)
    },
    {
      header: "Partita",
      accessor: "home_team",
      render: (game) => (
        <div className="flex flex-col">
          <span className="text-sm text-secondary-400">{getLeagueName(game.league)}</span>
          <span className="font-medium">{game.home_team} vs {game.away_team}</span>
        </div>
      )
    },
    {
      header: "Tipo",
      accessor: "selectedOutcome.type"
    },
    {
      header: "Rating",
      accessor: "selectedOutcome.rating",
      render: (game) => (
        <span className="text-primary-400">{game.selectedOutcome.rating.toFixed(2)}%</span>
      )
    },
    {
      header: "Calcolatore",
      accessor: "",
      render: (game) => (
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
          className="bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded text-sm transition-colors"
        >
          Calcola
        </button>
      )
    },
    {
      header: "Bookmaker",
      accessor: "selectedOutcome.bookmaker"
    },
    {
      header: "Quota",
      accessor: "selectedOutcome.odds",
      render: (game) => (
        <span className="text-emerald-400">{game.selectedOutcome.odds}</span>
      )
    },
    {
      header: "Exchange",
      accessor: "",
      render: () => "Betfair"
    },
    {
      header: "Quota Exchange",
      accessor: "selectedOutcome.betfairOdds",
      render: (game) => (
        <span className="text-primary-300">{game.selectedOutcome.betfairOdds}</span>
      )
    }
  ];

  //MAIN PAGE//
  return (
    <div className="min-h-screen bg-secondary-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-primary-500 mb-4">ODDSMATCHER</h2>

          {/* Filters Section */}
          <div className="bg-secondary-900 rounded-lg p-4 mb-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <DateRangeFilter
                dateRange={dateRange}
                setDateRange={setDateRange}
              />
              <RatingRangeFilter
                ratingRange={ratingRange}
                setRatingRange={setRatingRange}
              />
              <OddsRangeFilter 
                oddsRange={oddsRange}
                setOddsRange={setOddsRange}
              />
              <BookmakersFilter
                selectedBookmakers={selectedBookmakers}
                setSelectedBookmakers={setSelectedBookmakers}
                bookmakerMapping={bookmakerMapping}
                bookmakerOptions={bookmakerOptions}
              />
            </div>
            <div className="mt-4">
              <SearchFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                suggestions={getUniqueMatches()}
                setSuggestions={setSuggestions}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Utilizzo del componente Table */}
          <Table 
            columns={oddsMatcherColumns}
            data={getCurrentPageOdds()}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredOdds.length}
            itemsPerPage={ITEMS_PER_PAGE}
            setCurrentPage={setCurrentPage}
            emptyMessage="No odds available."
          />
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