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

    // Trova le richieste rifiutate
    const rejectedRequests = await CampaignRequest.find({
      username: username,
      status: 'REJECTED'
    });

    // Restituisci tutte le richieste suddivise per stato
    res.json({ pendingRequests, approvedRequests, rejectedRequests });
  } catch (error) {
    console.error('Errore nel recupero delle richieste:', error);
    res.status(500).json({ 
      message: 'Errore nel recupero delle richieste', 
      error: error.message 
    });
  }
});

router.get('/:uniqueLink', async (req, res) => {
  try {
    // Ricostruisci l'intero percorso senza "/api" per il confronto
    const relativePath = req.originalUrl.replace('/api', ''); // Elimina solo '/api'

    console.log('Percorso richiesto:', relativePath);

    // Cerchiamo nel DB usando il percorso corretto
    const campaignRequest = await CampaignRequest.findOne({ uniqueLink: relativePath });

    if (!campaignRequest) {
      return res.status(404).send('Link non trovato.');
    }

    // Verifica che lo stato sia "APPROVED"
    if (campaignRequest.status !== 'APPROVED') {
      return res.status(403).send('Il link non è ancora approvato.');
    }

    // Reindirizzamento all'URL reale
    console.log('Reindirizzamento a:', campaignRequest.realRedirectUrl);
    return res.redirect(campaignRequest.realRedirectUrl);

  } catch (error) {
    console.error('Errore nel reindirizzamento:', error.message);
    return res.status(500).send('Errore interno del server.');
  }
});

module.exports = router;