const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth'); // Importa le route di autenticazione

const app = express();
const port = process.env.PORT || 3000; // Utilizza una variabile d'ambiente per la porta

// Connessione a MongoDB
mongoose.connect('mongodb://localhost:27017/webapp', {
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

// Serve index.html sulla root route e per tutte le altre rotte
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Avvio del server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
