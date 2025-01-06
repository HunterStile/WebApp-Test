const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const axios = require('axios');
require('dotenv').config();

// Validazione email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Verifica reCAPTCHA
async function verifyCaptcha(token) {
  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token
        }
      }
    );
    console.log('Risposta verifica captcha:', response.data);
    return response.data.success;
  } catch (error) {
    console.error('Errore verifica captcha:', error);
    return false;
  }
}

// Registrazione
router.post('/register', async (req, res) => {
  const {
    username,
    password,
    firstName,
    lastName,
    email,
    country,
    language,
    acceptedTerms,
    newsletterSubscription,
    captchaToken
  } = req.body;
  console.log('Captcha token ricevuto:', captchaToken);
  console.log('Dati ricevuti per la registrazione:', req.body);
  
  try {
    // Validazione campi
    if (!username || !password || !firstName || !lastName || !email || !country || !language) {
      return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
    }

    // Validazione email
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email non valida' });
    }

    // Validazione lingua
    const validLanguages = ['it', 'de', 'en', 'es'];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({ error: 'Lingua non valida' });
    }
 
    // Validazione termini
    if (!acceptedTerms) {
      return res.status(400).json({ error: 'Devi accettare i termini e le condizioni' });
    }

    // Verifica captcha
    const isCaptchaValid = await verifyCaptcha(captchaToken);
    if (!isCaptchaValid) {
      return res.status(400).json({ error: 'Verifica captcha fallita' });
    }

    // Verifica se username esiste già
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username già in uso' });
    }

    // Verifica se email esiste già
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email già in uso' });
    }

    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creazione nuovo utente
    const user = new User({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      email,
      country,
      language,
      acceptedTerms,
      newsletterSubscription,
    });

    await user.save();

    res.status(201).json({
      message: 'Utente registrato con successo',
      user: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }
    });

  } catch (error) {
    console.error('Errore registrazione:', error);
    res.status(500).json({ error: 'Errore durante la registrazione' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Credenziali non valide' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Credenziali non valide' });
    }

    // Qui potresti aggiungere la generazione del JWT token

    res.json({
      message: 'Login effettuato con successo',
      user: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }
    });

  } catch (error) {
    console.error('Errore login:', error);
    res.status(500).json({ error: 'Errore durante il login' });
  }
});

module.exports = router;