const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const oddsRoutes = require('./routes/odds');

require('dotenv').config();
const app = express();
const port = process.env.PORT || 5001;

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
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes - Rimuovi il prefisso /api poiché viene gestito da nginx
app.use('/auth', authRoutes);
app.use('/odds', oddsRoutes);

// Catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});