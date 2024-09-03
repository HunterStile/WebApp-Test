// server/routes/odds.js
const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const router = express.Router();

const API_KEY = '934a387b72ea34f5a437446fdf4f5e9b';
const BASE_URL = 'https://api.the-odds-api.com/v4/sports';
const sportKey = 'soccer';
const regions = 'eu';
const markets = 'h2h';
const oddsFormat = 'decimal';
const dateFormat = 'iso';

// Configura il caching con un tempo di scadenza di 1 minuto (60 secondi)
const cache = new NodeCache({ stdTTL: 1000, checkperiod: 10 });

const fetchOddsData = async () => {
  try {
    console.log('Fetching new odds data...');
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
    const data = await fetchOddsData();
    if (data) {
      cache.set('oddsData', data);
      console.log('Odds data cached successfully');
    }
  } catch (error) {
    console.error('Failed to update cached odds:', error.message);
    // Non fare nulla, mantiene i dati esistenti nel cache
  }
};

// Aggiorna i dati ogni 1 minuto
setInterval(updateCachedOdds, 15 * 60 * 1000);

// Prima di tutto, esegui un aggiornamento
updateCachedOdds();

// Route per ottenere le quote delle partite imminenti
router.get('/upcoming-odds', (req, res) => {
  const oddsData = cache.get('oddsData');
  if (oddsData) {
    res.json(oddsData);
  } else {
    console.error('No odds data available in cache');
    res.status(500).send('No odds data available at the moment.');
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

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching sports data:', error.message);
    res.status(500).send('Failed to fetch sports data.');
  }
});

module.exports = router;
