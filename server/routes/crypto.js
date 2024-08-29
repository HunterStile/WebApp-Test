// Modifica per la testnet
const BASE_URL = 'https://api.blockcypher.com/v1/btc/test3'; // Testnet URL

// Endpoint per la creazione dell'indirizzo
const CREATE_ADDRESS_URL = `${BASE_URL}/addrs`;

// Endpoint per l'invio della transazione
const SEND_TX_URL = `${BASE_URL}/txs/send`;

// Endpoint per la registrazione del webhook
const WEBHOOK_URL = `${BASE_URL}/hooks?token=cdd434bbb074468ab1fa2bc2956ac0e4`; // Modifica il token per la testnet se necessario

// server/routes/crypto.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const axios = require('axios');

// Funzione per crittografare la chiave privata
function encryptPrivateKey(privateKey, secret) {
  const cipher = crypto.createCipher('aes-256-cbc', secret);
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Funzione per decrittografare la chiave privata
function decryptPrivateKey(encryptedPrivateKey, secret) {
  const decipher = crypto.createDecipher('aes-256-cbc', secret);
  let decrypted = decipher.update(encryptedPrivateKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Funzione per trasferire i fondi al cold wallet
async function transferToColdWallet(privateKey, coldWalletAddress, amount) {
  // Usa la libreria bitcoinjs-lib o la BlockCypher API per creare, firmare e inviare la transazione
  const txData = {
    inputs: [{ addresses: [privateKey] }],
    outputs: [{ addresses: [coldWalletAddress], value: amount }],
  };

  const tx = await axios.post(SEND_TX_URL, txData);
  const signedTx = signTransaction(tx.data, privateKey); // Firma la transazione

  await axios.post(SEND_TX_URL, { tx: signedTx });
}

router.post('/create-address', async (req, res) => {
  const { username } = req.body;
  const secret = process.env.SECRET_KEY || 'your-secret-key'; // Usa una chiave segreta sicura

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
    const response = await axios.post(CREATE_ADDRESS_URL, {});
    const btcAddress = response.data.address;
    const privateKey = response.data.private;

    // Crittografa la chiave privata e salva l'indirizzo BTC nel database
    const encryptedPrivateKey = encryptPrivateKey(privateKey, secret);
    user.btcAddress = btcAddress;
    user.encryptedPrivateKey = encryptedPrivateKey;
    await user.save();

    // Registra il webhook per monitorare le transazioni confermate
    await axios.post(WEBHOOK_URL, {
      event: 'confirmed-tx',
      address: btcAddress,
      url: 'http://localhost:3000/api/crypto/webhook',
    });

    res.json({ btcAddress });
  } catch (error) {
    console.error('Error creating BTC address:', error);
    res.status(500).send('Error creating BTC address');
  }
});

router.post('/webhook', async (req, res) => {
  const { address, confirmed, value } = req.body;
  const secret = process.env.SECRET_KEY || 'your-secret-key';
  const coldWalletAddress = process.env.COLD_WALLET_ADDRESS || 'your-cold-wallet-address';

  if (confirmed) {
    try {
      const user = await User.findOne({ btcAddress: address });
      if (user) {
        user.btcBalance += value / 100000000; // Converti Satoshis a BTC
        await user.save();

        // Decrittografa la chiave privata per eseguire la transazione
        const privateKey = decryptPrivateKey(user.encryptedPrivateKey, secret);

        // Trasferisci i fondi dal hot wallet al cold wallet
        await transferToColdWallet(privateKey, coldWalletAddress, value);
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
