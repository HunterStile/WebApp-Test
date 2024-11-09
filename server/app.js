const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth'); // Importa le route di autenticazione
const cors = require('cors'); // Aggiungi cors se non l'hai già fatto
const tcRoutes = require('./routes/tc'); // Importa le rotte per TC
const cryptoRoutes = require('./routes/crypto'); // Importa le rotte per le criptovalute
const oddsRoutes = require('./routes/odds');

require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000; // Utilizza una variabile d'ambiente per la porta

// Abilita CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://192.168.56.10:3000',
  credentials: true
}));

// Connessione a MongoDB
//mongoose.connect('mongodb://localhost:27017/webapp', {
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/WebApp-Test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware per analizzare i corpi JSON
app.use(bodyParser.json());

// Serve i file statici dalla build di React
app.use(express.static(path.join(__dirname, '..', 'public')));

// Usa le route di autenticazione
app.use('/api/auth', authRoutes);
app.use('/api/tc', tcRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/odds', oddsRoutes);

// Serve index.html sulla root route e per tutte le altre rotte
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Avvio del server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});
