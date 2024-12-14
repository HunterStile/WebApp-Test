const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Percorso al tuo modello User
const CampaignRequest = require('../models/CampaignRequest')

// Rotta per richiedere campagna
router.post('/campaign-requests', async (req, res) => {
  const { campaign, username } = req.body;

  try {
    // Trova l'utente tramite username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    // Verifica se esiste già una richiesta pending per questa campagna
    const existingRequest = await CampaignRequest.findOne({
      username: username,
      campaign: campaign,
      status: 'PENDING'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Hai già una richiesta pending per questa campagna' });
    }

    const newRequest = new CampaignRequest({
      username: username,
      campaign: campaign,
      status: 'PENDING'
    });

    await newRequest.save();

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Errore durante la richiesta campagna:', error);
    res.status(500).json({ 
      message: 'Errore nel salvataggio della richiesta', 
      error: error.message 
    });
  }
});

// Nuova rotta per recuperare le richieste dell'utente
router.get('/user-requests', async (req, res) => {
  const { username } = req.query;

  try {
    // Trova le richieste pending
    const pendingRequests = await CampaignRequest.find({
      username: username,
      status: 'PENDING'
    });

    // Trova le richieste approvate
    const approvedRequests = await CampaignRequest.find({
      username: username,
      status: 'APPROVED'
    });

    res.json({ pendingRequests, approvedRequests });
  } catch (error) {
    console.error('Errore nel recupero delle richieste:', error);
    res.status(500).json({ 
      message: 'Errore nel recupero delle richieste', 
      error: error.message 
    });
  }
});

module.exports = router;