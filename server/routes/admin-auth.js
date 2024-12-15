const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

// Chiave segreta (da tenere al sicuro in variabili d'ambiente)
const SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'super-secret-admin-key';

// Registrazione Admin
router.post('/register', async (req, res) => {
  const { username, password, secretKey } = req.body;

  try {
    // Verifica della chiave segreta
    if (secretKey !== SECRET_KEY) {
      return res.status(403).send('Chiave segreta non valida');
    }

    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creazione di un nuovo admin
    const admin = new Admin({
      username,
      password: hashedPassword,
      secretKey: SECRET_KEY // Salviamo la chiave nel database
    });

    // Salva l'admin nel database
    await admin.save();
    res.status(201).send('Admin registrato con successo');
  } catch (error) {
    console.error(error);
    res.status(400).send('Errore durante la registrazione');
  }
});

// Login Admin
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(400).send('Credenziali non valide');
    }

    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      return res.status(400).send('Credenziali non valide');
    }

    res.send('Admin loggato con successo');
  } catch (error) {
    console.error(error);
    res.status(500).send('Errore durante il login');
  }
});

module.exports = router;
