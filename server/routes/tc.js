// server/routes/tc.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const axios = require('axios');

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
    if (action === 'completeTask' || action === 'sellEggs') {
      user.tcBalance += amount;
    } else {
      return res.status(400).send('Invalid action');
    }

    await user.save();
    res.send('TC earned successfully');
  } catch (error) {
    console.error('Error earning TC:', error);
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
  const { username, eggType, price, quantity } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Controlla se l'utente ha abbastanza uova di quel tipo
    if (!user.eggs.has(eggType) || user.eggs.get(eggType) < quantity) {
      return res.status(400).send('Not enough eggs of this type available for sale');
    }

    // Cerca se esiste già un'entrata nel mercato con lo stesso eggType e prezzo
    const existingSaleIndex = user.eggsForSale.findIndex(
      (egg) => egg.eggType === eggType && egg.price === price
    );

    if (existingSaleIndex !== -1) {
      // Se esiste, aggiorna la quantità
      user.eggsForSale[existingSaleIndex].quantity += quantity;
    } else {
      // Se non esiste, aggiungi una nuova entry con la quantità
      user.eggsForSale.push({ eggType, price, quantity });
    }

    // Riduci il conteggio delle uova nell'inventario
    user.eggs.set(eggType, user.eggs.get(eggType) - quantity);

    await user.save();
    res.send('Eggs put up for sale successfully');
  } catch (error) {
    res.status(500).send('Error selling eggs');
  }
});

// Compra un uovo dal mercato secondario
router.post('/buy-egg', async (req, res) => {
  const { username, eggType, price, quantity } = req.body;

  try {
    console.log('Request Body:', req.body);

    const buyer = await User.findOne({ username });
    if (!buyer) {
      return res.status(404).send('Buyer not found');
    }

    console.log('Buyer:', buyer);

    const seller = await User.findOne({
      'eggsForSale.eggType': eggType,
      'eggsForSale.price': price,
    });

    if (!seller) {
      return res.status(404).send('Seller not found');
    }

    console.log('Seller:', seller);

    const eggForSale = seller.eggsForSale.find(
      (egg) => egg.eggType === eggType && egg.price === price
    );

    if (!eggForSale || eggForSale.quantity < quantity) {
      return res.status(400).send('Not enough eggs available');
    }

    const totalCost = price * quantity;

    if (buyer.tcBalance < totalCost) {
      return res.status(400).send('Insufficient TC balance');
    }

    buyer.tcBalance -= totalCost;
    seller.tcBalance += totalCost;
    eggForSale.quantity -= quantity;

    if (eggForSale.quantity === 0) {
      seller.eggsForSale = seller.eggsForSale.filter(
        (egg) => !(egg.eggType === eggType && egg.price === price)
      );
    }

    if (buyer.eggs.has(eggType)) {
      buyer.eggs.set(eggType, buyer.eggs.get(eggType) + quantity);
    } else {
      buyer.eggs.set(eggType, quantity);
    }

    await buyer.save();
    await seller.save();

    console.log('Purchase successful');
    res.send('Purchase successful');
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).send('Error processing purchase');
  }
});

// Ottieni tutte le uova in vendita nel mercato secondario
router.get('/eggs-for-sale', async (req, res) => {
  try {
    const usersWithEggsForSale = await User.find({ 'eggsForSale.0': { $exists: true } });

    let eggTypeMap = {};

    usersWithEggsForSale.forEach(user => {
      user.eggsForSale.forEach(egg => {
        const quantity = Number(egg.quantity) || 0;
        const price = Number(egg.price) || 0;

        if (eggTypeMap[egg.eggType]) {
          eggTypeMap[egg.eggType].totalQuantity += quantity;
          eggTypeMap[egg.eggType].totalPrice += price * quantity;

          if (
            eggTypeMap[egg.eggType].floorPrice === undefined ||
            price < eggTypeMap[egg.eggType].floorPrice
          ) {
            eggTypeMap[egg.eggType].floorPrice = price;
          }
        } else {
          eggTypeMap[egg.eggType] = {
            eggType: egg.eggType,
            totalQuantity: quantity,
            totalPrice: price * quantity,
            averagePrice: 0,
            floorPrice: price,
          };
        }
      });
    });

    Object.keys(eggTypeMap).forEach(eggType => {
      const eggData = eggTypeMap[eggType];
      if (eggData.totalQuantity > 0) {
        eggData.averagePrice = eggData.totalPrice / eggData.totalQuantity;
      } else {
        eggData.averagePrice = 0;
      }
    });

    const eggsForSale = Object.values(eggTypeMap);

    res.json(eggsForSale);
  } catch (error) {
    console.error('Error fetching eggs for sale:', error);
    res.status(500).send('Error fetching eggs for sale');
  }
});

// Ottieni gli articoli in vendita per un tipo di egg specifico
router.get('/egg-sales', async (req, res) => {
  const { eggType } = req.query;

  if (!eggType) {
    return res.status(400).send('Egg type is required');
  }

  try {
    const usersWithEggsForSale = await User.find({ 'eggsForSale.0': { $exists: true } });

    let sales = [];

    usersWithEggsForSale.forEach(user => {
      user.eggsForSale.forEach(egg => {
        if (egg.eggType === eggType) {
          const quantity = Number(egg.quantity) || 0;
          const price = Number(egg.price) || 0;
          if (quantity > 0 && price > 0) {
            sales.push({ price, quantity });
          }
        }
      });
    });

    // Ordina per prezzo crescente
    sales.sort((a, b) => a.price - b.price);

    res.json(sales);
  } catch (error) {
    console.error('Error fetching egg sales:', error);
    res.status(500).send('Error fetching egg sales');
  }
});

module.exports = router;