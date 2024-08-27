// server/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Registrazione
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Creazione di un nuovo utente con 10 TC iniziali
    const user = new User({
      username,
      password: hashedPassword,
      tcBalance: 10 // Assegna 10 TC all'utente durante la registrazione
    });
    // Salva l'utente nel database
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(400).send('Error registering user');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).send('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).send('Invalid credentials');
    }

    res.send('User logged in successfully');
  } catch (error) {
    res.status(500).send('Error logging in user');
  }
});

module.exports = router;
