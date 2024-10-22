// backend/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

const BETFAIR_CONFIG = {
    appKey: 'LZaNDBMfDOrUsTmXU5T', // La tua DELAY Application Key
    username: 'antonioaltieri565@outlook.it',
    password: 'Avellino1!'
  };

let sessionToken = null;

// Login e gestione session token
async function getBetfairSession() {
  try {
    const response = await axios.post(
      'https://identitysso.betfair.it/api/login',
      {},
      {
        headers: {
          'X-Application': BETFAIR_CONFIG.appKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: BETFAIR_CONFIG.username,
          password: BETFAIR_CONFIG.password
        }
      }
    );
    sessionToken = response.data.token;
    return sessionToken;
  } catch (error) {
    console.error('Errore login Betfair:', error);
    throw error;
  }
}

// Route per ottenere le partite
app.get('/matches', async (req, res) => {
  try {
    const token = await getBetfairSession();
    
    const response = await axios.post(
      'https://api.betfair.it/exchange/betting/rest/v2.0/listMarketCatalogue/',
      {
        filter: {
          eventTypeIds: ['1'],
          marketTypeCodes: ['MATCH_ODDS'],
          marketBettingTypes: ['ODDS'],
          marketCountries: ['IT'],
          marketStartTime: {
            from: new Date().toISOString()
          }
        },
        maxResults: 10,
        marketProjection: ['EVENT', 'RUNNER_DESCRIPTION']
      },
      {
        headers: {
          'X-Application': BETFAIR_CONFIG.appKey,
          'X-Authentication': token,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route per ottenere le quote di un mercato specifico
app.get('/odds/:marketId', async (req, res) => {
  try {
    const token = await getBetfairSession();
    
    const response = await axios.post(
      'https://api.betfair.it/exchange/betting/rest/v2.0/listMarketBook/',
      {
        marketIds: [req.params.marketId],
        priceProjection: {
          priceData: ['EX_BEST_OFFERS'],
          virtualise: true
        }
      },
      {
        headers: {
          'X-Application': BETFAIR_CONFIG.appKey,
          'X-Authentication': token,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json(response.data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});