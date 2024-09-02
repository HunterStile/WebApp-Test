// server/routes/odds.js
const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const router = express.Router();

const API_KEY = '934a387b72ea34f5a437446fdf4f5e9b'; // Sostituisci con il tuo token API
const BASE_URL = 'https://api.the-odds-api.com/v4/sports';
const sportKey = 'soccer'; // Puoi usare 'upcoming' o una chiave sport specifica
const regions = 'eu'; // Puoi modificare questo parametro
const markets = 'h2h'; // Puoi modificare questo parametro
const oddsFormat = 'decimal'; // Puoi modificare questo parametro
const dateFormat = 'iso'; // Puoi modificare questo parametro

// Configura il caching con un tempo di scadenza di 15 minuti (900 secondi)
const cache = new NodeCache({ stdTTL: 900, checkperiod: 60 });

const fetchOddsData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/${sportKey}/odds`, {
      params: {
        apiKey: API_KEY,
        regions,
        markets,
        oddsFormat,
        dateFormat,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching odds data:', error);
    return null;
  }
};

// Inizialmente, memorizza i dati
const updateCachedOdds = async () => {
  const data = await fetchOddsData();
  if (data) {
    cache.set('oddsData', data);
  }
};

// Aggiorna i dati ogni 15 minuti
setInterval(updateCachedOdds, 15 * 60 * 1000);

// Prima di tutto, esegui un aggiornamento
updateCachedOdds();

// Route per ottenere le quote delle partite imminenti
router.get('/upcoming-odds', (req, res) => {
  const oddsData = cache.get('oddsData');
  if (oddsData) {
    res.json(oddsData);
  } else {
    res.status(500).send('Error fetching upcoming odds');
  }
});

module.exports = router;
