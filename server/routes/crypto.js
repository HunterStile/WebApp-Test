// server/routes/crypto.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const axios = require('axios');
const bitcoin = require('bitcoinjs-lib'); // Aggiungi la libreria bitcoinjs-lib

// Configura gli endpoint per BlockCypher
const BASE_URL = 'https://api.blockcypher.com/v1/btc/main';
const CREATE_ADDRESS_URL = `${BASE_URL}/addrs`;
const SEND_TX_URL = `${BASE_URL}/txs/send`;
const WEBHOOK_URL = `${BASE_URL}/hooks?token=cdd434bbb074468ab1fa2bc2956ac0e4`; // Modifica il token se necessario

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
  const network = bitcoin.networks.testnet;
  const keyPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), { network });
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network });

  // Costruisci la transazione
  const txb = new bitcoin.TransactionBuilder(network);
  txb.addInput('input_txid', 0); // Inserisci il TXID e l'index dell'input
  txb.addOutput(coldWalletAddress, amount); // Output al cold wallet

  // Firma la transazione
  txb.sign(0, keyPair);
  const tx = txb.build();
  const txHex = tx.toHex();

  // Invia la transazione alla rete
  await axios.post(SEND_TX_URL, { tx: txHex });
}

router.post('/create-address', async (req, res) => {
  const { username } = req.body;
  const secret = process.env.SECRET_KEY || 'your-secret-key';

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Controlla se l'utente ha già un indirizzo BTC
    if (user.btcAddress) {
      return res.json({ btcAddress: user.btcAddress });
    }

    // Genera un nuovo indirizzo BTC testnet
    const response = await axios.post(CREATE_ADDRESS_URL, {});
    const { address: btcAddress, private: privateKey } = response.data;

    // Crittografa la chiave privata e salva l'indirizzo BTC nel database
    const encryptedPrivateKey = encryptPrivateKey(privateKey, secret);
    user.btcAddress = btcAddress;
    user.encryptedPrivateKey = encryptedPrivateKey;
    await user.save();

    // Registra il webhook per monitorare le transazioni confermate
    try {
      await axios.post(WEBHOOK_URL, {
        event: 'confirmed-tx',
        address: btcAddress,
        url: 'http://localhost:3000/api/crypto/webhook',
      });
    } catch (webhookError) {
      console.error('Error registering webhook:', webhookError.response ? webhookError.response.data : webhookError.message);
    }

    res.json({ btcAddress });
  } catch (error) {
    console.error('Error creating BTC address:', error.message);
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
      console.error('Error processing BTC transaction:', error.message);
      res.status(500).send('Error processing BTC transaction');
    }
  } else {
    res.sendStatus(200);
  }
});

module.exports = router;
