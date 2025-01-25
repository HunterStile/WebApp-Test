const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Payment = require('../models/Payment');
const axios = require('axios');
const emailService = require('../services/emailService');
const multer = require('multer');
const path = require('path');


// Validazione email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Verifica reCAPTCHA
async function verifyCaptcha(token) {
  console.log('Token ricevuto dal client:', token);

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

    console.log('Risposta da Google:', response.data);

    return response.data.success;
  } catch (error) {
    console.error('Errore durante la verifica di reCAPTCHA:', error.message);
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

    // Invia email di benvenuto
    try {
      await emailService.sendWelcomeEmail(user);
    } catch (emailError) {
      console.error('Errore invio email di benvenuto:', emailError);
      // Non blocchiamo la registrazione se l'invio dell'email fallisce
    }
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

// Recupero profilo basato su username
router.get('/profile', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username non fornito' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Errore nel recupero del profilo:', error);
    res.status(500).json({ error: 'Errore durante il recupero del profilo' });
  }
});

// Aggiornamento profilo basato su username
router.put('/profile', async (req, res) => {
  const { 
    username, 
    firstName, 
    lastName, 
    paypalAddress, 
    bitcoinAddress, 
    paymentMethod 
  } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username not provided' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update profile fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    user.paypalAddress = paypalAddress;
    user.bitcoinAddress = bitcoinAddress;
    user.paymentMethod = paymentMethod;

    await user.save();

    res.json({ user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Error during profile update' });
  }
});

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile-images/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.body.username}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Add to your existing routes
router.post('/upload-profile-image', upload.single('profileImage'), async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Save relative path
    const imagePath = `uploads/profile-images/${req.file.filename}`;
    user.profileImage = imagePath;
    await user.save();

    res.json({ 
      message: 'Profile image uploaded successfully',
      imageUrl: imagePath
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ error: 'Error uploading profile image' });
  }
});

router.get('/payments/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const payments = await Payment.find({ username }).exec();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero dei pagamenti' });
  }
});

module.exports = router;