// server/routes/crypto.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const axios = require('axios');
const crypto = require('crypto');
const { Buffer } = require('buffer');
const bitcoin = require('bitcoinjs-lib');

// Configura gli endpoint per BlockCypher Testnet
const BASE_URL = 'https://api.blockcypher.com/v1/bcy/test';
const CREATE_ADDRESS_URL = `${BASE_URL}/addrs?token=cdd434bbb074468ab1fa2bc2956ac0e4`;
const SEND_TX_URL = `${BASE_URL}/txs/send?token=cdd434bbb074468ab1fa2bc2956ac0e4`;
const WEBHOOK_URL = `${BASE_URL}/hooks?token=cdd434bbb074468ab1fa2bc2956ac0e4`;
const FAUCET_URL = 'https://api.blockcypher.com/v1/bcy/test/faucet?token=cdd434bbb074468ab1fa2bc2956ac0e4';
const API_BASE_URL = 'https://87ba-82-57-91-108.ngrok-free.app/api/crypto/webhook';

// Funzione aggiornata per crittografare la chiave privata
function encryptPrivateKey(privateKey) {
  const secret = process.env.SECRET_KEY;
  const iv = crypto.randomBytes(16);  // Inizializzazione IV per AES
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secret, 'hex'), iv);
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;  // Concatena l'IV con il messaggio crittografato
}

// Funzione aggiornata per decrittare la chiave privata
function decryptPrivateKey(encryptedPrivateKey) {
  const secret = process.env.SECRET_KEY;
  const parts = encryptedPrivateKey.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secret, 'hex'), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

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

    // Genera un nuovo indirizzo BTC testnet
    const response = await axios.post(CREATE_ADDRESS_URL, {});
    const { address: btcAddress, private: privateKey } = response.data;

    // Crittografa la chiave privata e salva l'indirizzo BTC nel database
    const encryptedPrivateKey = encryptPrivateKey(privateKey);
    user.btcAddress = btcAddress;
    user.encryptedPrivateKey = encryptedPrivateKey;
    await user.save();

    // Registra il webhook per monitorare le transazioni confermate
    try {
      await axios.post(WEBHOOK_URL, {
        event: 'confirmed-tx',
        address: btcAddress,
        url: API_BASE_URL,  // Usa l'URL di ngrok generato
      });
    } catch (webhookError) {
      console.error('Error registering webhook:', webhookError.response ? webhookError.response.data : webhookError.message);
    }

    res.json({ btcAddress });
    console.log('Secret Key:', process.env.SECRET_KEY);
  } catch (error) {
    console.error('Error creating BTC address:', error.message);
    res.status(500).send('Error creating BTC address');
  }
});

// Endpoint per ricevere i webhook di BlockCypher
router.post('/webhook', async (req, res) => {
  console.log('Received webhook payload:', req.body);

  const { addresses, confirmations, outputs } = req.body;

  if (!addresses || confirmations === undefined || !outputs) {
    console.error('Invalid webhook payload', req.body);
    return res.status(400).send('Invalid webhook payload');
  }

  // Verifica che la transazione sia confermata
  if (confirmations === 0) {
    console.log('Transaction not yet confirmed');
    return res.status(200).send('Transaction not yet confirmed');
  }

  try {
    // Cerca l'utente in base agli indirizzi coinvolti
    const user = await User.findOne({ btcAddress: { $in: addresses } });
    if (!user) {
      console.error('User not found for address:', addresses);
      return res.status(404).send('User not found');
    }

    // Somma il valore totale degli output che corrispondono all'indirizzo dell'utente
    let amountReceived = 0;
    outputs.forEach(output => {
      if (output.addresses && output.addresses.includes(user.btcAddress)) {
        amountReceived += output.value;
      }
    });

    // Aggiorna il saldo dell'utente
    user.btcBalance += amountReceived;
    await user.save();

    console.log(`Saldo aggiornato per l'indirizzo ${user.btcAddress}: ${user.btcBalance}`);
    res.status(200).send('Webhook received and processed');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

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

// Endpoint to send BTC from one testnet wallet to another
router.post('/send-transaction', async (req, res) => {
  const { username, recipientAddress, amount } = req.body;
  
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send('User not found');
    }

    const { btcAddress, encryptedPrivateKey } = user;

    // Fetch UTXOs for the sender's address
    const utxosResponse = await axios.get(`${BASE_URL}/addrs/${btcAddress}?unspentOnly=true`);
    const utxos = utxosResponse.data.txrefs;

    // Calculate total amount available
    const totalAvailable = utxos.reduce((sum, utxo) => sum + utxo.value, 0);

    if (totalAvailable < amount) {
      return res.status(400).send('Insufficient balance');
    }

    // Decrypt private key
    const privateKeyHex = decryptPrivateKey(encryptedPrivateKey);
    console.log('Decrypted private key:', privateKeyHex);

    // Convert hex private key to Buffer
    const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');

    // Dynamically import bitcoinjs-lib
    // Not necessary in this version, use the `require` syntax
    // const bitcoin = await getBitcoinLib(); // This line is not needed in `6.x.x`
  
    // Create a keypair from the private key
    const keyPair = bitcoin.ECPair.fromPrivateKey(privateKeyBuffer, { network: bitcoin.networks.testnet });
  
    // Create a new Psbt (Partially Signed Bitcoin Transaction)
    const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet });

    // Add inputs (UTXOs)
    utxos.forEach((utxo) => {
      psbt.addInput({
        hash: utxo.tx_hash,
        index: utxo.tx_output_n,
        nonWitnessUtxo: Buffer.from(utxo.script, 'hex'), // Provide the raw transaction hex for each UTXO
      });
    });

    // Add the recipient output
    psbt.addOutput({
      address: recipientAddress,
      value: amount,
    });

    // Add the change output (remaining funds after fee)
    const fee = 5000;  // Example fee in satoshis
    const change = totalAvailable - amount - fee;
    if (change > 0) {
      psbt.addOutput({
        address: btcAddress,
        value: change,
      });
    }

    // Sign the transaction
    psbt.signAllInputs(keyPair);

    // Finalize the transaction
    psbt.finalizeAllInputs();

    // Build the raw transaction hex
    const rawTransaction = psbt.extractTransaction().toHex();

    // Broadcast the transaction
    const sendResponse = await axios.post(SEND_TX_URL, { tx: rawTransaction });

    res.json({ message: 'Transaction sent successfully', data: sendResponse.data });
  } catch (error) {
    console.error('Error sending transaction:', error.message);
    res.status(500).send('Error sending transaction');
  }
});

module.exports = router;
