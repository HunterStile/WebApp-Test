// server/routes/crypto.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const axios = require('axios');

router.post('/create-address', async (req, res) => {
    const { username } = req.body;
  
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      // Controlla se l'utente ha già un indirizzo BTC
      if (user.btcAddress) {
        return res.json({ btcAddress: user.btcAddress });
      }
  
      // Genera un nuovo indirizzo BTC utilizzando BlockCypher
      const response = await axios.post('https://api.blockcypher.com/v1/btc/main/addrs', {});
      const btcAddress = response.data.address;
  
      // Salva l'indirizzo BTC nel database
      user.btcAddress = btcAddress;
      await user.save();
  
      // Registra il webhook per monitorare le transazioni confermate per l'indirizzo generato
      await axios.post(`https://api.blockcypher.com/v1/btc/main/hooks?token=cdd434bbb074468ab1fa2bc2956ac0e4`, {
        event: 'confirmed-tx',
        address: btcAddress,
        url: 'http://localhost:3000/api/crypto/webhook', // Modifica con il tuo dominio reale
      });
  
      res.json({ btcAddress });
    } catch (error) {
      console.error('Error creating BTC address:', error);
      res.status(500).send('Error creating BTC address');
    }
  });

router.post('/webhook', async (req, res) => {
    const { address, confirmed, value } = req.body;
  
    if (confirmed) {
      try {
        const user = await User.findOne({ btcAddress: address });
        if (user) {
          user.btcBalance += value / 100000000; // Converti Satoshis a BTC
          await user.save();
        }
        res.sendStatus(200);
      } catch (error) {
        console.error('Error processing BTC transaction:', error);
        res.status(500).send('Error processing BTC transaction');
      }
    } else {
      res.sendStatus(200);
    }
  });

module.exports = router;
