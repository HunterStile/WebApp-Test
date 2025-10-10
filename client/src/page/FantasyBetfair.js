//page/FantasyBetfair.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import Table from '../components/Table';

const ITEMS_PER_PAGE = 10;

const FantasyBetfair = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scraperStatus, setScraperStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch opportunities
  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/odds/fantasy-betfair`);
      
      // Check if response is an array (successful data) or object (scraping in progress)
      if (Array.isArray(response.data)) {
        setOpportunities(response.data);
        
        // Calculate total items: each match has multiple outcomes
        const totalItems = response.data.reduce((sum, match) => {
          return sum + (match.opportunities ? match.opportunities.length : 0);
        }, 0);
        setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE));
      } else if (response.data.message) {
        // Scraping in progress
        setError(response.data.message);
        setOpportunities([]);
      }
    } catch (err) {
      if (err.response?.status === 202) {
        setError('Scraping in corso... Riprova tra qualche istante.');
        setOpportunities([]);
      } else if (err.response?.status === 503) {
        setError('API Flask non avviata. Esegui: python scraper/api.py');
      } else {
        setError(err.response?.data?.error || 'Errore nel recupero dei dati');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch scraper status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/odds/fantasy-betfair/status`);
      setScraperStatus(response.data);
    } catch (err) {
      console.error('Error fetching status:', err);
    }
  }, []);

  // Force refresh
  const handleRefresh = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/odds/fantasy-betfair/refresh`);
      setError('Refresh avviato. Attendere circa 30-60 secondi...');
      
      // Poll for updates every 5 seconds
      const interval = setInterval(async () => {
        await fetchOpportunities();
        await fetchStatus();
      }, 5000);

      // Stop polling after 2 minutes
      setTimeout(() => clearInterval(interval), 120000);
    } catch (err) {
      setError('Errore durante il refresh');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOpportunities();
    fetchStatus();
    
    // Poll status every 30 seconds
    const interval = setInterval(() => {
      fetchStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchOpportunities, fetchStatus]);

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    // Check if opportunities is an array
    if (!Array.isArray(opportunities)) {
      console.error('Opportunities is not an array:', opportunities);
      return [];
    }
    
    console.log('📊 Opportunities array:', opportunities);
    console.log('📊 Opportunities length:', opportunities.length);
    
    // Flatten: each match can have multiple outcomes (1, X, 2)
    // Transform from: [{match, opportunities: [{outcome: "1", ...}, {outcome: "X", ...}]}]
    // To: [{match, outcome: "1", ...}, {match, outcome: "X", ...}]
    const flattenedData = opportunities.flatMap(match => {
      // Check if match has opportunities array
      if (!match.opportunities || !Array.isArray(match.opportunities)) {
        console.warn('Match missing opportunities array:', match);
        return [];
      }
      
      console.log(`✅ Match found: ${match.home_team} vs ${match.away_team}, outcomes:`, match.opportunities.length);
      
      return match.opportunities.map(opp => ({
        home_team: match.home_team,
        away_team: match.away_team,
        commence_time: match.commence_time,
        outcome: opp.outcome,
        fantasy_team_odd: opp.fantasy_team_odd,
        betfair_odd: opp.betfair_odd,
        rating: opp.rating
      }));
    });
    
    console.log('📊 Flattened data length:', flattenedData.length);
    console.log('📊 Flattened data:', flattenedData);
    
    // Sort by rating (highest first)
    const sorted = flattenedData.sort((a, b) => b.rating - a.rating);
    
    return sorted.slice(startIndex, endIndex);
  };

  // Format date
  const formatDate = (dateString) => {
    if (dateString === 'Unknown') return dateString;
    try {
      return new Date(dateString).toLocaleString('it-IT');
    } catch {
      return dateString;
    }
  };

  // Calculate profit and liability
  const calculateDetails = (ftOdd, bfOdd, stake = 100, commission = 0.05) => {
    const effectiveBetfairOdd = bfOdd - commission;
    const lay = (ftOdd / effectiveBetfairOdd) * stake;
    const liability = (lay * bfOdd) - lay;
    const profit = (ftOdd - 1) * stake - (bfOdd - 1) * lay;

    return {
      lay: lay.toFixed(2),
      liability: liability.toFixed(2),
      profit: profit.toFixed(2)
    };
  };

  // Table columns definition
  const columns = [
    {
      header: "Data/Ora",
      accessor: "commence_time",
      render: (row) => (
        <span className="text-sm">{formatDate(row.commence_time)}</span>
      )
    },
    {
      header: "Partita",
      accessor: "home_team",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.home_team}</span>
          <span className="text-sm text-secondary-400">vs</span>
          <span className="font-medium">{row.away_team}</span>
        </div>
      )
    },
    {
      header: "Esito",
      accessor: "outcome",
      render: (row) => (
        <span className="px-2 py-1 bg-primary-600 rounded text-sm font-bold">
          {row.outcome}
        </span>
      )
    },
    {
      header: "Rating",
      accessor: "rating",
      render: (row) => (
        <span className={`font-bold text-lg ${
          row.rating >= 100 ? 'text-green-400' : 
          row.rating >= 95 ? 'text-yellow-400' : 
          'text-red-400'
        }`}>
          {row.rating.toFixed(2)}%
        </span>
      )
    },
    {
      header: "Fantasy Team",
      accessor: "fantasy_team_odd",
      render: (row) => (
        <span className="text-emerald-400 font-semibold">{row.fantasy_team_odd}</span>
      )
    },
    {
      header: "Betflag Exchange",
      accessor: "betfair_odd",
      render: (row) => (
        <span className="text-blue-400 font-semibold">{row.betfair_odd}</span>
      )
    },
    {
      header: "Dettagli",
      accessor: "",
      render: (row) => {
        const details = calculateDetails(row.fantasy_team_odd, row.betfair_odd);
        return (
          <div className="text-xs space-y-1">
            <div>Bancata: €{details.lay}</div>
            <div>Resp.: €{details.liability}</div>
            <div className={parseFloat(details.profit) > 0 ? 'text-green-400' : 'text-red-400'}>
              Profit: €{details.profit}
            </div>
          </div>
        );
      }
    }
  ];

  return (
    <div className="min-h-screen bg-secondary-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-primary-500">
              Fantasy Team ⚡ Betflag Exchange
            </h2>
            <button
              onClick={handleRefresh}
              disabled={loading || scraperStatus?.is_scraping}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-700 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw size={20} className={loading || scraperStatus?.is_scraping ? 'animate-spin' : ''} />
              {loading || scraperStatus?.is_scraping ? 'Scraping...' : 'Refresh'}
            </button>
          </div>

          {/* Status Bar */}
          {scraperStatus && (
            <div className="bg-secondary-900 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {scraperStatus.is_scraping ? (
                      <>
                        <RefreshCw size={16} className="animate-spin text-yellow-400" />
                        <span className="text-yellow-400">Scraping in corso...</span>
                      </>
                    ) : scraperStatus.has_data ? (
                      <>
                        <CheckCircle size={16} className="text-green-400" />
                        <span className="text-green-400">Dati disponibili</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} className="text-red-400" />
                        <span className="text-red-400">Nessun dato</span>
                      </>
                    )}
                  </div>
                  {scraperStatus.last_update && (
                    <div className="text-sm text-secondary-400">
                      Ultimo aggiornamento: {new Date(scraperStatus.last_update).toLocaleString('it-IT')}
                    </div>
                  )}
                </div>
                <div className="text-sm text-secondary-400">
                  Opportunità trovate: <span className="text-primary-400 font-bold">{scraperStatus.opportunities_count}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500 text-blue-400 p-4 rounded-lg mb-6">
            <h3 className="font-bold mb-2">ℹ️ Come funziona:</h3>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Le quote vengono scrapate da <strong>Fantasy Team</strong> (bookmaker) e <strong>Betflag Exchange</strong> (bancata)</li>
              <li>Il <strong>Rating &gt;100%</strong> indica un'opportunità di arbitraggio (profitto garantito)</li>
              <li>Punta su Fantasy Team e banca su Betflag Exchange per bloccare il profitto</li>
              <li>I dati vengono aggiornati automaticamente ogni 15 minuti</li>
            </ul>
          </div>
        </div>

        {/* Table */}
        {loading && opportunities.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw size={48} className="animate-spin mx-auto mb-4 text-primary-500" />
            <p className="text-secondary-400">Caricamento opportunità...</p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={getCurrentPageData()}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={opportunities.length}
            itemsPerPage={ITEMS_PER_PAGE}
            setCurrentPage={setCurrentPage}
            emptyMessage="Nessuna opportunità disponibile. Prova a fare un refresh."
          />
        )}
      </div>
    </div>
  );
};

export default FantasyBetfair;
