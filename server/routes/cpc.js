const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Percorso al tuo modello User
const CampaignRequest = require('../models/CampaignRequest')
const Campaign = require('../models/Campaign');

// Endpoint per ottenere tutte le campagne
router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero delle campagne', error: error.message });
  }
});

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
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Hai già una richiesta per questa campagna' });
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

    // Trova le richieste disattivate
    const deactivatedRequests = await CampaignRequest.find({
      username: username,
      status: 'DEACTIVATED'
    });

    // Restituisci tutte le richieste suddivise per stato
    res.json({ pendingRequests, approvedRequests, deactivatedRequests, rejectedRequests });
  } catch (error) {
    console.error('Errore nel recupero delle richieste:', error);
    res.status(500).json({ 
      message: 'Errore nel recupero delle richieste', 
      error: error.message 
    });
  }
});

// Rotta per ottenere il totale dei click filtrati per username
router.get('/total-clicks', async (req, res) => {
  try {
    const { username, startDate, endDate, viewMode } = req.query;

    let query = { username: username };

    // Se siamo in modalità mensile e abbiamo date di inizio e fine
    if (viewMode === 'monthly' && startDate && endDate) {
      query['clicksHistory.timestamp'] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const campaigns = await CampaignRequest.find(query);
    
    let totalClicks = 0;

    if (viewMode === 'monthly' && startDate && endDate) {
      // Conta solo i click nel range di date specificato
      campaigns.forEach(campaign => {
        const filteredClicks = campaign.clicksHistory.filter(click => 
          click.timestamp >= new Date(startDate) && 
          click.timestamp <= new Date(endDate)
        );
        totalClicks += filteredClicks.length;
      });
    } else {
      // In modalità annuale, conta tutti i click
      totalClicks = campaigns.reduce((sum, campaign) => sum + campaign.clicksHistory.length, 0);
    }

    res.json({ totalClicks });
  } catch (error) {
    console.error('Errore nel recupero dei click totali:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.get('/:uniqueLink', async (req, res) => {
  try {
    const relativePath = req.originalUrl.replace('/api', '');
    console.log('Percorso richiesto:', relativePath);

    const campaignRequest = await CampaignRequest.findOne({ uniqueLink: relativePath });

    if (!campaignRequest) {
      return res.status(404).send('Link non trovato.');
    }

    if (campaignRequest.status !== 'APPROVED') {
      return res.status(403).send('Il link non è ancora approvato.');
    }

    // Incrementa il contatore generale
    campaignRequest.clicks += 1;

    // Aggiungi il nuovo click con timestamp
    campaignRequest.clicksHistory.push({
      timestamp: new Date(),
      ip: req.ip, // opzionale
      userAgent: req.headers['user-agent'] // opzionale
    });

    await campaignRequest.save();

    console.log('Reindirizzamento a:', campaignRequest.realRedirectUrl);
    return res.redirect(campaignRequest.realRedirectUrl);

  } catch (error) {
    console.error('Errore nel reindirizzamento:', error.message);
    return res.status(500).send('Errore interno del server.');
  }
});



module.exports = router;