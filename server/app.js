const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const oddsRoutes = require('./routes/odds');
const gamblingRoutes = require('./routes/gambling');

require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware per il CORS (importante per le API)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Connessione a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/WebApp-Test', {
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes - Rimuovi il prefisso /api poiché viene gestito da nginx
app.use('/api/auth', authRoutes);
app.use('/api/odds', oddsRoutes);
app.use('/api/gambling', gamblingRoutes);


// Mappa delle campagne con gli URL reali
const campaignUrls = {
  BETANO: 'https://www.gambling-affiliation.com/cpc/v=g5MTrVQ96U0IQlw1NeFO-hIm1W43ZmVn0.gSTfMxo2s_GA7331V2&aff_var_1=',
  ROLLETTO: 'https://www.gambling-affiliation.com/cpc/v=CDv-VvGTatah4ZD6IPtEqcDZjnem9BRZ3z2oz1PDuhg_GA7331V2&aff_var_1=',
  TIKIAKA: 'https://www.gambling-affiliation.com/cpc/v=WD9KR0uuFFaj9029..91PF4Kwbtu9Re0s6ZO6fobNIk_GA7331V2&aff_var_1=',
  CAZEURS: 'https://www.gambling-affiliation.com/cpc/v=Xb75XCL1vA3pLoGQnEc6OtsmD1AFzUlVf2Rm5zd.DwM_GA7331V2&aff_var_1=',
};

// Endpoint per gestire i link fittizi
app.get('/cpc/:randomValue', (req, res) => {
  const { randomValue } = req.params; // Valore casuale generato
  const { campaign, user } = req.query; // Nome campagna e username

  if (!campaign || !user) {
    return res.status(400).send('Parametri mancanti: assicurati che il link contenga campagna e username.');
  }

  // Trova il link reale corrispondente alla campagna
  const realUrl = campaignUrls[campaign];
  if (!realUrl) {
    return res.status(404).send('Campagna non trovata.');
  }

  // Crea il link reale con l'username
  const redirectUrl = `${realUrl}${user}`;

  console.log(`Reindirizzamento per campagna "${campaign}" con user "${user}": ${redirectUrl}`);
  res.redirect(redirectUrl);
});

// Catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});