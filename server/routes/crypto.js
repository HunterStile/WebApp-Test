// server/routes/crypto.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const axios = require('axios');
const crypto = require('crypto');
const bitcoin = require('bitcoinjs-lib');

// Configura gli endpoint per BlockCypher Testnet
const BASE_URL = 'https://api.blockcypher.com/v1/bcy/test';
const CREATE_ADDRESS_URL = `${BASE_URL}/addrs?token=cdd434bbb074468ab1fa2bc2956ac0e4`;
const SEND_TX_URL = `${BASE_URL}/txs/send?token=cdd434bbb074468ab1fa2bc2956ac0e4`;
const WEBHOOK_URL = `${BASE_URL}/hooks?token=cdd434bbb074468ab1fa2bc2956ac0e4`;
const FAUCET_URL = 'https://api.blockcypher.com/v1/bcy/test/faucet?token=cdd434bbb074468ab1fa2bc2956ac0e4';

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

// Endpoint per ricevere i webhook di BlockCypher
router.post('/webhook', async (req, res) => {
  try {
    const { address, confirmed, value } = req.body;

    // Verifica se l'indirizzo è quello giusto
    if (!address || !confirmed || !value) {
      return res.status(400).send('Invalid webhook payload');
    }

    // Trova l'utente nel database per aggiornare il saldo
    const user = await User.findOne({ address });
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Aggiungi il valore al saldo dell'utente
    user.balance += value;
    await user.save();

    console.log(`Saldo aggiornato per l'indirizzo ${address}: ${user.balance}`);
    res.status(200).send('Webhook received and processed');
  } catch (error) {
    console.error('Errore nella gestione del webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;

router.post('/request-faucet', async (req, res) => {
  const { address, amount } = req.body;
  try {
    const response = await axios.post(FAUCET_URL, {
      address,
      amount
    });
    res.json({ message: 'Fondi inviati con successo', data: response.data });
  } catch (error) {
    console.error('Error requesting funds from faucet:', error.message);
    res.status(500).send('Error requesting funds from faucet');
  }
});


router.get('/balance/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Assumi che user.btcBalance contenga il saldo BTC dell'utente
    res.json({ balance: user.btcBalance });
  } catch (error) {
    console.error('Error fetching BTC balance:', error.message);
    res.status(500).send('Error fetching BTC balance');
  }
});

module.exports = router;
