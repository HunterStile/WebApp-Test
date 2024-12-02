// server/routes/odds.js
const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const router = express.Router();

const API_KEY = '75555127482ee54e4a4d261370d5098a';  //934a387b72ea34f5a437446fdf4f5e9b
const BASE_URL = 'https://api.the-odds-api.com/v4/sports';
const regions = 'eu';
const markets = 'h2h';
const oddsFormat = 'decimal';
const dateFormat = 'iso';

// Configura il caching con un tempo di scadenza di 15 minuti
const cache = new NodeCache({ stdTTL: 1000, checkperiod: 10 });

const fetchOddsData = async (sportKey) => {
  try {
    console.log(`Fetching new odds data for sport ${sportKey}...`);
    const response = await axios.get(`${BASE_URL}/${sportKey}/odds`, {
      params: {
        apiKey: API_KEY,
        regions,
        markets,
        oddsFormat,
        dateFormat,
      }
    });
    console.log('New odds data fetched successfully');
    return response.data;
  } catch (error) {
    console.error('Error fetching odds data:', error.message);
    throw new Error('Failed to fetch odds data');
  }
};

const updateCachedOdds = async () => {
  try {
    const data = await fetchOddsData('soccer'); // Default sport
    if (data) {
      cache.set('oddsData', data);
      console.log('Odds data cached successfully');
    }
  } catch (error) {
    console.error('Failed to update cached odds:', error.message);
    // Non fare nulla, mantiene i dati esistenti nel cache
  }
};

// Aggiorna i dati ogni 15 minuti
//setInterval(updateCachedOdds, 15 * 60 * 1000);

// Prima di tutto, esegui un aggiornamento
//updateCachedOdds();

// Route per ottenere le quote delle partite imminenti
router.get('/upcoming-odds', async (req, res) => {
  const sportKey = req.query.sportKey || 'soccer'; // Usa 'soccer' come valore di default

  // Verifica se i dati sono già nella cache
  const cachedOdds = cache.get(`oddsData_${sportKey}`);
  if (cachedOdds) {
    console.log('Returning cached odds data');
    return res.json(cachedOdds);
  }

  try {
    console.log(`Fetching odds data for sport ${sportKey}...`);
    const oddsData = await fetchOddsData(sportKey);
    cache.set(`oddsData_${sportKey}`, oddsData); // Salva i dati nella cache
    res.json(oddsData);
  } catch (error) {
    console.error('Error fetching odds data:', error.message);
    res.status(500).send('Failed to fetch odds data.');
  }
});

// Route per ottenere la lista di sport
router.get('/sports', async (req, res) => {
  const all = req.query.all === 'true'; // Controlla se il parametro "all" è presente e settato a true

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        apiKey: API_KEY,
        all: all, // Passa il parametro "all" all'API
      }
    });
    //console.log('Sports data received:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching sports data:', error.message);
    res.status(500).send('Failed to fetch sports data.');
  }
});

router.get('/major-leagues', async (req, res) => {
  const majorLeagues = [
    //'soccer_italy_serie_a',
    //'soccer_germany_bundesliga',
    //'soccer_france_ligue_one',
    //'soccer_england_league1',
    'soccer_spain_la_liga'
  ];

  try {
    // Fetch parallelo per tutti i campionati
    const leaguePromises = majorLeagues.map(async (league) => {
      const cachedData = cache.get(`oddsData_${league}`);
      if (cachedData) {
        return { league, data: cachedData };
      }

      const data = await fetchOddsData(league);
      cache.set(`oddsData_${league}`, data);
      return { league, data };
    });

    const results = await Promise.all(leaguePromises);

    // Combina i risultati in un unico array
    const combinedOdds = results.flatMap(result => {
      return result.data.map(game => ({
        ...game,
        league: result.league
      }));
    });

    res.json(combinedOdds);
  } catch (error) {
    console.error('Error fetching major leagues data:', error);
    res.status(500).send('Failed to fetch major leagues data.');
  }
});

module.exports = router;
