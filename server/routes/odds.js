// server/routes/odds.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = '934a387b72ea34f5a437446fdf4f5e9b'; // Sostituisci con il tuo token API
const BASE_URL = 'https://api.the-odds-api.com/v4/sports';
const sportKey = 'soccer'; // Puoi usare 'upcoming' o una chiave sport specifica
const regions = 'eu'; // Puoi modificare questo parametro
const markets = 'h2h'; // Puoi modificare questo parametro
const oddsFormat = 'decimal'; // Puoi modificare questo parametro
const dateFormat = 'iso'; // Puoi modificare questo parametro

// Route per ottenere le quote delle partite imminenti
router.get('/upcoming-odds', async (req, res) => {
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
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching upcoming odds:', error);
    res.status(500).send('Error fetching upcoming odds');
  }
});

module.exports = router;
