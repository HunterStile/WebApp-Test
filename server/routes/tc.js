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

// Metti in vendita un uovo nel mercato secondario
router.post('/sell-egg', async (req, res) => {
  const { username, eggType, price } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Controlla se l'utente ha abbastanza uova di quel tipo
    if (!user.eggs.has(eggType) || user.eggs.get(eggType) <= 0) {
      return res.status(400).send('No eggs of this type available for sale');
    }

    // Riduci il conteggio delle uova e aggiungi l'uovo al mercato
    user.eggs.set(eggType, user.eggs.get(eggType) - 1);
    user.eggsForSale.push({ eggType, price });

    await user.save();
    res.send('Egg put up for sale successfully');
  } catch (error) {
    res.status(500).send('Error selling egg');
  }
});

// Compra un uovo dal mercato secondario
router.post('/buy-egg', async (req, res) => {
  const { buyerUsername, sellerUsername, eggType, price } = req.body;

  try {
    const buyer = await User.findOne({ username: buyerUsername });
    const seller = await User.findOne({ username: sellerUsername });

    if (!buyer || !seller) {
      return res.status(404).send('User not found');
    }

    // Verifica se l'acquirente ha abbastanza TC
    if (buyer.tcBalance < price) {
      return res.status(400).send('Insufficient TC balance');
    }

    // Trova l'uovo in vendita e rimuovilo
    const eggIndex = seller.eggsForSale.findIndex(egg => egg.eggType === eggType && egg.price === price);
    if (eggIndex === -1) {
      return res.status(404).send('Egg not found for sale');
    }

    seller.eggsForSale.splice(eggIndex, 1);
    buyer.tcBalance -= price;
    seller.tcBalance += price;

    // Aggiungi l'uovo all'inventario dell'acquirente
    if (buyer.eggs.has(eggType)) {
      buyer.eggs.set(eggType, buyer.eggs.get(eggType) + 1);
    } else {
      buyer.eggs.set(eggType, 1);
    }

    await buyer.save();
    await seller.save();
    console.log('Buyer:', buyerUsername);
    console.log('Seller:', sellerUsername);
    console.log('Egg Type:', eggType);
    console.log('Price:', price);
    res.send('Egg purchased successfully');
  } catch (error) {
    res.status(500).send('Error purchasing egg');
  }
});

// Ottieni tutte le uova in vendita nel mercato secondario
router.get('/eggs-for-sale', async (req, res) => {
  try {
    // Trova tutti gli utenti che hanno uova in vendita
    const usersWithEggsForSale = await User.find({ 'eggsForSale.0': { $exists: true } });

    // Crea un array per contenere tutte le uova in vendita
    let eggsForSale = [];

    // Itera su ciascun utente con uova in vendita
    usersWithEggsForSale.forEach(user => {
      user.eggsForSale.forEach(egg => {
        eggsForSale.push({
          sellerUsername: user.username,
          eggType: egg.eggType,
          price: egg.price,
        });
      });
    });

    res.json(eggsForSale);
  } catch (error) {
    res.status(500).send('Error fetching eggs for sale');
  }
});

module.exports = router;

module.exports = router;
