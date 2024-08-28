// server/routes/tc.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Ottieni il saldo di TC dell'utente
router.get('/balance', async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json({ tcBalance: user.tcBalance });
  } catch (error) {
    res.status(500).send('Error fetching TC balance');
  }
});

// Otteiene TC tramite azioni
router.post('/earn', async (req, res) => {
  const { username, amount, action } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Aggiungi logica per il guadagno in base all'azione
    if (action === 'completeTask') {
      user.tcBalance += amount;
    } else if (action === 'purchaseMysteryBox') {
      user.tcBalance += amount;
    } // Aggiungi altre azioni se necessario

    await user.save();
    res.send('TC earned successfully');
  } catch (error) {
    res.status(500).send('Error earning TC');
  }
});

// Spendi TC
router.post('/spend', async (req, res) => {
  const { username, amount } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Verifica se l'utente ha abbastanza TC per spendere
    if (user.tcBalance < amount) {
      return res.status(400).send('Insufficient TC balance');
    }

    user.tcBalance -= amount;
    await user.save();
    res.send('TC spent successfully');
  } catch (error) {
    res.status(500).send('Error spending TC');
  }
});

// Salva l'apertura di una mystery box e memorizza l'uovo
router.post('/open-box', async (req, res) => {
  const { username, eggType } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Aggiungi o aggiorna il conteggio dell'uovo nel database
    if (user.eggs.has(eggType)) {
      user.eggs.set(eggType, user.eggs.get(eggType) + 1);
    } else {
      user.eggs.set(eggType, 1);
    }

    await user.save();
    res.send('Mystery box opened and egg saved successfully');
  } catch (error) {
    res.status(500).send('Error opening mystery box');
  }
});

// Ottieni l'inventario delle uova dell'utente
router.get('/eggs', async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json({ eggs: user.eggs });
  } catch (error) {
    res.status(500).send('Error fetching eggs');
  }
});

module.exports = router;
