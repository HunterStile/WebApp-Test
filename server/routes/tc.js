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

// Incuba un uovo
router.post('/incubate', async (req, res) => {
  const { username, eggType } = req.body;

  try {
    // Verifica che username e eggType siano presenti
    if (!username || !eggType) {
      return res.status(400).json({ error: 'Missing username or eggType' });
    }

    // Trova l'utente
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    // Verifica che l'utente abbia abbastanza uova di quel tipo
    if (!user.eggs.has(eggType) || user.eggs.get(eggType) <= 0) {
      return res.status(400).json({ error: `Non hai abbastanza uova di tipo ${eggType}` });
    }

    const incubationTimes = {
      'Common Egg': 1 * 60 * 1000,      // 1 minuto
      'Uncommon Egg': 10 * 60 * 1000,   // 10 minuti
      'Rare Egg': 60 * 60 * 1000,       // 1 ora
      'Epic Egg': 24 * 60 * 60 * 1000,  // 24 ore
      'Legendary Egg': 7 * 24 * 60 * 60 * 1000, // 1 settimana
    };

    // Verifica se il tipo di uovo esiste nell'incubationTimes
    if (!incubationTimes.hasOwnProperty(eggType)) {
      return res.status(400).json({ error: 'Tipo di uovo non valido' });
    }

    // Calcola il tempo di fine incubazione
    const incubationEndTime = new Date(Date.now() + incubationTimes[eggType]);

    // Aggiungi l'uovo nell'incubatore
    user.incubators.push({
      eggType,
      incubationEndTime
    });

    // Rimuovi un uovo dall'inventario
    const eggCount = user.eggs.get(eggType);
    user.eggs.set(eggType, eggCount - 1);

    // Salva l'utente
    await user.save();

    res.json({ success: 'Uovo inserito nell\'incubatore' });
  } catch (error) {
    res.status(500).json({ error: 'Errore durante l\'incubazione' });
  }
});

// Ottieni le uova incubate dell'utente
router.get('/incubators', async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ incubators: user.incubators });
  } catch (error) {
    console.error('Error fetching incubators:', error);
    res.status(500).json({ error: 'Error fetching incubators' });
  }
});

// Genera un drago in base alla rarità dell'uovo
const generateDragon = (eggType) => {
  const dragons = {
    'Common Egg': { name: 'Common Dragon', resistance: 10, miningPower: 5 },
    'Uncommon Egg': { name: 'Uncommon Dragon', resistance: 20, miningPower: 10 },
    'Rare Egg': { name: 'Rare Dragon', resistance: 30, miningPower: 20 },
    'Epic Egg': { name: 'Epic Dragon', resistance: 40, miningPower: 30 },
    'Legendary Egg': { name: 'Legendary Dragon', resistance: 50, miningPower: 50 },
  };
  return dragons[eggType] || { name: 'Unknown Dragon', resistance: 0, miningPower: 0 };
};

// Endpoint per aprire un uovo incubato
router.post('/open-incubated-egg', async (req, res) => {
  const { username, index } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    if (index < 0 || index >= user.incubators.length) {
      return res.status(400).json({ error: 'Indice dell\'uovo non valido' });
    }

    const incubatedEgg = user.incubators[index];
    const { eggType } = incubatedEgg;

    // Genera il drago in base al tipo di uovo
    const dragon = generateDragon(eggType);

    // Rimuovi l'uovo dall'incubatore
    user.incubators.splice(index, 1);

    // Aggiungi il drago all'inventario dell'utente
    user.dragons.push(dragon);

    await user.save();

    res.json({ success: 'Uovo aperto con successo', dragon });
  } catch (error) {
    console.error('Errore durante l\'apertura dell\'uovo:', error);
    res.status(500).json({ error: 'Errore durante l\'apertura dell\'uovo' });
  }
});

// Endpoint per recuperare i draghi dell'utente
router.get('/dragons', async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    res.json({ dragons: user.dragons });
  } catch (error) {
    console.error('Errore durante il recupero dei draghi:', error);
    res.status(500).json({ error: 'Errore durante il recupero dei draghi' });
  }
});

module.exports = router;