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
    const { username } = req.query; // Prendi il parametro username dalla query

    if (!username) {
      return res.status(400).json({ message: 'Il parametro username è richiesto.' });
    }

    // Somma di tutti i valori del campo 'clicks' per l'utente specificato
    const totalClicks = await CampaignRequest.aggregate([
      {
        $match: { username } // Filtra i documenti per il campo 'username'
      },
      {
        $group: {
          _id: null, // Non raggruppiamo per alcun campo
          totalClicks: { $sum: "$clicks" } // Somma dei valori di 'clicks'
        }
      }
    ]);

    // Se non ci sono documenti, restituisci 0
    const total = totalClicks.length > 0 ? totalClicks[0].totalClicks : 0;

    res.json({ totalClicks: total });
  } catch (error) {
    console.error('Errore nel calcolo dei click totali:', error);
    res.status(500).json({ 
      message: 'Errore nel calcolo dei click totali', 
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

    // Incrementa il numero di click
    campaignRequest.clicks += 1;
    await campaignRequest.save();

    // Reindirizzamento all'URL reale
    console.log('Reindirizzamento a:', campaignRequest.realRedirectUrl);
    return res.redirect(campaignRequest.realRedirectUrl);

  } catch (error) {
    console.error('Errore nel reindirizzamento:', error.message);
    return res.status(500).send('Errore interno del server.');
  }
});



module.exports = router;