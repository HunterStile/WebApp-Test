// server/routes/tc.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const axios = require('axios');
const cron = require('node-cron');
const TOTAL_REWARDS_TC = 10; // La quantità totale di TC distribuita ogni intervallo di tempo
const TOTAL_REWARDS_SATOSHI = 500; // La quantità totale di Satoshi distribuita ogni intervallo di tempo

//CRON JOB//

const distributeRewards = async () => {
  try {
    // Calcola la potenza totale del server
    const totalServerPowerResult = await User.aggregate([{ $group: { _id: null, total: { $sum: "$totalMiningPower" } } }]);
    const totalServerPower = totalServerPowerResult.length > 0 ? totalServerPowerResult[0].total : 0;

    if (totalServerPower === 0) {
      console.log('Nessuna potenza di mining attiva, nessuna ricompensa distribuita.');
      return;
    }

    // Recupera tutti gli utenti
    const users = await User.find();

    users.forEach(async (user) => {
      if (user.totalMiningPower > 0) {
        // Calcola la quota di ricompensa in base alla potenza di mining dell'utente
        const rewardRatio = user.totalMiningPower / totalServerPower;
        const rewardTc = TOTAL_REWARDS_TC * rewardRatio;
        const rewardSatoshi = TOTAL_REWARDS_SATOSHI * rewardRatio;

        // Aggiungi le ricompense all'utente
        user.tcBalance += rewardTc;
        user.btcBalance += rewardSatoshi;

        await user.save();
        console.log(`Ricompense distribuite a ${user.username}: ${rewardTc.toFixed(2)} TC e ${rewardSatoshi.toFixed(2)} Satoshi.`);
      }
    });
  } catch (error) {
    console.error('Errore durante la distribuzione delle ricompense:', error);
  }
};

// Esegui il cron job ogni 10 minuti
//cron.schedule('*/10 * * * *', distributeRewards);
cron.schedule('*/10 * * * *', distributeRewards); // Esegui ogni minuto

//FUNZIONI AUSILIARI//

// Funzione per generare un valore casuale tra min e max
const getRandomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Funzione per determinare il bonus basato su probabilità
const getRandomBonus = () => {
  const rand = Math.random();
  if (rand < 0.75) return 0;
  if (rand < 0.95) return 1;
  return 2;
};

// Funzione per calcolare la potenza totale di mining
const calculateTotalMiningPower = (miningZone) => {
  let totalPower = 0;
  let totalBonus = 0;

  // Calcola il bonus totale
  miningZone.forEach(dragon => {
    totalBonus += dragon.bonus;
  });

  // Applica il bonus totale alla potenza di ogni drago
  miningZone.forEach(dragon => {
    totalPower += dragon.miningPower * (1 + totalBonus / 100);
  });

  return totalPower;
};

// Aggiungi questa funzione nel tuo backend
const getTimeUntilNextRewards = async (req, res) => {
  const currentTime = new Date();
  const nextRewardTime = new Date();
  
  // Supponiamo che il cron job distribuisca ricompense ogni 10 minuti
  nextRewardTime.setMinutes(Math.ceil(currentTime.getMinutes() / 10) * 10);
  nextRewardTime.setSeconds(0);

  const timeDiff = nextRewardTime - currentTime; // Differenza in millisecondi
  const secondsRemaining = Math.max(Math.floor(timeDiff / 1000), 0); // Rimuovi eventuali valori negativi

  res.json({ secondsRemaining });
};

//GENERAZIONE DRAGHI//

// Genera un drago in base alla rarità dell'uovo
const generateDragon = (eggType) => {
  const dragons = {
    'Common Egg': [
      {
        name: 'Fire Dragon',
        resistance: getRandomInRange(4, 6),
        miningPower: getRandomInRange(9, 11),
        bonus: getRandomBonus(),
        probability: 33
      },
      {
        name: 'Water Dragon',
        resistance: getRandomInRange(6, 8),
        miningPower: getRandomInRange(7, 9),
        bonus: getRandomBonus(),
        probability: 33
      },
      {
        name: 'Grass Dragon',
        resistance: getRandomInRange(9, 11),
        miningPower: getRandomInRange(4, 6),
        bonus: getRandomBonus(),
        probability: 34
      }
    ],
    'Uncommon Egg': [{ name: 'Uncommon Dragon', resistance: 20, miningPower: 10 }],
    'Rare Egg': [{ name: 'Rare Dragon', resistance: 30, miningPower: 20 }],
    'Epic Egg': [{ name: 'Epic Dragon', resistance: 40, miningPower: 30 }],
    'Legendary Egg': [{ name: 'Legendary Dragon', resistance: 50, miningPower: 50 }],
  };

  // Seleziona casualmente il drago in base alle probabilità
  if (eggType === 'Common Egg') {
    const randomValue = Math.random() * 100;
    let cumulativeProbability = 0;
    for (const dragon of dragons['Common Egg']) {
      cumulativeProbability += dragon.probability;
      if (randomValue <= cumulativeProbability) {
        return { name: dragon.name, resistance: dragon.resistance, miningPower: dragon.miningPower, bonus: dragon.bonus };
      }
    }
  }

  // Per le altre uova, restituisce il primo (unico) drago
  return dragons[eggType]?.[0] || { name: 'Unknown Dragon', resistance: 0, miningPower: 0 };
};

// INIZIO ENDPONT //

// AZIONI PRINCIPALI PER LA MONETA CENTRALIZZATA //

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
    if (action === 'completeTask' || action === 'wincasino') {
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

// Aggiungi l'endpoint oer il calcolo del tempo da inviare al frontends
router.get('/time-until-next-rewards', getTimeUntilNextRewards);

// UOVA E DRAGHI 

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

// Recupera solo le uova messe in vendita dall'utente corrente
router.get('/my-eggs-for-sale', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Restituisci solo le uova che l'utente ha messo in vendita
    res.json(user.eggsForSale);
  } catch (error) {
    console.error('Error fetching user egg sales:', error);
    res.status(500).json({ error: 'An error occurred while fetching user egg sales' });
  }
});

// Rimuovi un uovo dalla vendita
router.post('/remove-egg-sale', async (req, res) => {
  const { username, eggType } = req.body;

  if (!username || !eggType) {
    return res.status(400).json({ error: 'Username and egg type are required' });
  }

  try {
    // Trova l'utente
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Trova l'uovo in vendita e rimuovilo
    const eggIndex = user.eggsForSale.findIndex((egg) => egg.eggType === eggType);

    if (eggIndex === -1) {
      return res.status(404).json({ error: 'Egg not found in user\'s sale list' });
    }

    // Aggiungi la quantità di uova di nuovo all'inventario dell'utente
    const eggToRemove = user.eggsForSale[eggIndex];
    user.eggs.set(eggType, (user.eggs.get(eggType) || 0) + eggToRemove.quantity);

    // Rimuovi l'uovo dalla lista delle vendite
    user.eggsForSale.splice(eggIndex, 1);

    // Salva le modifiche
    await user.save();

    res.json({ message: 'Egg sale removed successfully' });
  } catch (error) {
    console.error('Error removing egg sale:', error);
    res.status(500).json({ error: 'An error occurred while removing egg sale' });
  }
});

// Endpoint per aggiungere un drago alla zona mining
router.post('/add-to-mining-zone', async (req, res) => {
  const { username, dragonId } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    const dragonIndex = user.dragons.findIndex(d => d._id.toString() === dragonId);
    if (dragonIndex === -1) {
      return res.status(404).json({ error: 'Drago non trovato' });
    }

    const dragon = user.dragons[dragonIndex];
    user.miningZone.push(dragon);
    user.dragons.splice(dragonIndex, 1);

    // Calcola e aggiorna la potenza totale di mining
    user.totalMiningPower = calculateTotalMiningPower(user.miningZone);

    await user.save();

    res.json({ message: 'Drago aggiunto alla zona mining', miningZone: user.miningZone });
  } catch (error) {
    console.error('Errore durante l\'aggiunta del drago alla zona mining:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiunta del drago alla zona mining' });
  }
});

// Endpoint per recuperare i draghi nella zona mining
router.get('/mining-zone', async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    res.json({ miningZone: user.miningZone });
  } catch (error) {
    console.error('Errore durante il recupero della zona mining:', error);
    res.status(500).json({ error: 'Errore durante il recupero della zona mining' });
  }
});

// Endpoint per rimuovere un drago dalla zona mining
router.post('/remove-from-mining-zone', async (req, res) => {
  const { username, dragonId } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    const dragonIndex = user.miningZone.findIndex(d => d._id.toString() === dragonId);
    if (dragonIndex === -1) {
      return res.status(404).json({ error: 'Drago non trovato nella zona mining' });
    }

    const [removedDragon] = user.miningZone.splice(dragonIndex, 1);
    user.dragons.push(removedDragon);

    // Calcola e aggiorna la potenza totale di mining
    user.totalMiningPower = calculateTotalMiningPower(user.miningZone);

    await user.save();

    res.json({ message: 'Drago rimosso dalla zona mining', miningZone: user.miningZone });
  } catch (error) {
    console.error('Errore durante la rimozione del drago dalla zona mining:', error);
    res.status(500).json({ error: 'Errore durante la rimozione del drago dalla zona mining' });
  }
});

// Endpoint per ottenere la potenza totale del server
router.get('/server-mining-power', async (req, res) => {
  try {
    const users = await User.find(); // Recupera tutti gli utenti
    let totalServerPower = 0;

    users.forEach(user => {
      // Calcola la potenza totale di mining per ogni utente
      let userTotalPower = 0;
      let totalBonus = 1; // Bonus totale inizia a 1 (nessun bonus)
      
      user.miningZone.forEach(dragon => {
        totalBonus += dragon.bonus; // Somma tutti i bonus
      });

      user.miningZone.forEach(dragon => {
        userTotalPower += dragon.miningPower * totalBonus; // Applica il bonus totale
      });

      totalServerPower += userTotalPower; // Aggiungi alla potenza totale del server
    });

    res.json({ totalServerPower });
  } catch (error) {
    console.error('Errore durante il calcolo della potenza totale del server:', error);
    res.status(500).json({ error: 'Errore durante il calcolo della potenza totale del server' });
  }
});

// Endpoint per calcolare la potenza totale di mining del server
router.get('/total-mining-power', async (req, res) => {
  try {
    const users = await User.find({});
    let totalServerMiningPower = 0;

    // Calcola la potenza totale di mining del server
    users.forEach(user => {
      totalServerMiningPower += user.totalMiningPower || 0; // Assicurati di utilizzare la proprietà corretta
    });

    res.json({ totalServerMiningPower });
  } catch (error) {
    console.error('Errore durante il recupero della potenza totale di mining del server:', error);
    res.status(500).json({ error: 'Errore durante il recupero della potenza totale di mining del server' });
  }
});

// Endpoint per ottenere le ricompense stimate
router.get('/estimated-rewards', async (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.status(400).json({ error: 'Username non fornito' });
  }

  try {
    // Ottieni l'utente e la sua potenza di mining
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    const userMiningPower = user.totalMiningPower;

    // Ottieni la potenza totale di mining del server
    const allUsers = await User.find({});
    const totalServerMiningPower = allUsers.reduce((total, currentUser) => total + (currentUser.totalMiningPower || 0), 0);

    // Calcola le ricompense stimate in base alla potenza di mining dell'utente
    const tcReward = (userMiningPower / totalServerMiningPower) * TOTAL_REWARDS_TC;
    const satoshiReward = (userMiningPower / totalServerMiningPower) * TOTAL_REWARDS_SATOSHI;

    res.json({
      tc: isNaN(tcReward) ? 0 : tcReward,
      satoshi: isNaN(satoshiReward) ? 0 : satoshiReward,
    });
  } catch (error) {
    console.error('Errore durante il calcolo delle ricompense stimate:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// FINE ENDPONT //

module.exports = router;