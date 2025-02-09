const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Percorso al tuo modello User
const CampaignRequest = require('../models/CampaignRequest')
const Campaign = require('../models/Campaign');

// Endpoint per ottenere tutte le campagne
router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
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

router.get('/clicks-history', async (req, res) => {
  try {
    const { username, days } = req.query;
    
    if (!username) {
      return res.status(400).json({ error: 'Username richiesto' });
    }

    // Calcola la data di inizio basata sui giorni richiesti
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (parseInt(days) || 30));

    // Trova tutte le campagne dell'utente
    const campaigns = await CampaignRequest.find({ 
      username,
      'clicksHistory.timestamp': {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Estrai e appiattisci tutti i click da tutte le campagne
    let allClicks = [];
    campaigns.forEach(campaign => {
      const filteredClicks = campaign.clicksHistory.filter(click => 
        click.timestamp >= startDate && 
        click.timestamp <= endDate
      );
      
      // Aggiungi informazioni della campagna a ogni click
      const campaignClicks = filteredClicks.map(click => ({
        ...click.toObject(),
        campaignName: campaign.campaign,
        uniqueLink: campaign.uniqueLink
      }));
      
      allClicks = allClicks.concat(campaignClicks);
    });

    // Ordina i click per timestamp in ordine decrescente
    allClicks.sort((a, b) => b.timestamp - a.timestamp);

    res.json({
      clicksHistory: allClicks,
      totalClicks: allClicks.length,
      period: {
        start: startDate,
        end: endDate
      }
    });

  } catch (error) {
    console.error('Errore nel recupero della cronologia dei click:', error);
    res.status(500).json({ 
      error: 'Errore interno del server',
      message: error.message 
    });
  }
});

// Rotta per ottenere il totale dei click filtrati per username
router.get('/total-clicks', async (req, res) => {
  try {
    const { username, startDate, endDate, viewMode } = req.query;
    let query = { username: username };

    // Aggiungiamo la logica per filtrare in base al viewMode
    if (startDate && endDate) {
      query['clicksHistory.timestamp'] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const campaigns = await CampaignRequest.find(query);
    let totalClicks = 0;

    // Logica di conteggio in base al viewMode
    if (viewMode === 'daily' || viewMode === 'monthly') {
      // Per vista giornaliera e mensile, contiamo solo i click nel range di date
      campaigns.forEach(campaign => {
        const filteredClicks = campaign.clicksHistory.filter(click => 
          click.timestamp >= new Date(startDate) && 
          click.timestamp <= new Date(endDate)
        );
        totalClicks += filteredClicks.length;
      });
    } else {
      // Per vista annuale, contiamo tutti i click
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
      return res.status(403).send('Il link non è disponibile.');
    }

     // Trova la campagna corrispondente e verifica il suo stato
     const campaign = await Campaign.findOne({ name: campaignRequest.campaign });
    
     if (!campaign) {
       return res.status(404).send('Campagna non trovata.');
     }
 
     // Verifica se la campagna è attiva
     if (campaign.status !== 'attivo') {
       return res.status(403).send('La campagna non è attualmente attiva.');
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