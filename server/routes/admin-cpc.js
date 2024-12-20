const express = require('express');
const router = express.Router();
const CampaignRequest = require('../models/CampaignRequest');
const Campaign = require('../models/Campaign');

// Aggiungi o modifica una campagna
router.post('/campaigns', async (req, res) => {
  const { name, realUrl, description, conditions, commissionPlan, status, type, country } = req.body;

  if (!name || !realUrl || !description || !conditions || !commissionPlan || !status || !type || !country) {
    return res.status(400).json({ message: 'Tutti i campi sono richiesti' });
  }

  try {
    const existingCampaign = await Campaign.findOne({ name });
    if (existingCampaign) {
      return res.status(400).json({ message: 'La campagna esiste già' });
    }

    const newCampaign = new Campaign({ 
      name, 
      realUrl, 
      description, 
      conditions, 
      commissionPlan,
      status,
      type,
      country
    });
    await newCampaign.save();

    res.status(201).json({ message: 'Campagna aggiunta con successo', campaign: newCampaign });
  } catch (error) {
    res.status(500).json({ message: 'Errore nell\'aggiunta della campagna', error: error.message });
  }
});

// Modifica una campagna esistente
router.patch('/campaigns/:id', async (req, res) => {
  const { id } = req.params;
  const { name, realUrl, description, conditions, commissionPlan, status, type, country } = req.body;

  if (!name || !realUrl || !description || !conditions || !commissionPlan || !status || !type || !country) {
    return res.status(400).json({ message: 'Tutti i campi sono richiesti' });
  }

  try {
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campagna non trovata' });
    }

    campaign.name = name;
    campaign.realUrl = realUrl;
    campaign.description = description;
    campaign.conditions = conditions;
    campaign.commissionPlan = commissionPlan;
    campaign.status = status;
    campaign.type = type;
    campaign.country = country;

    await campaign.save();

    res.status(200).json({ message: 'Campagna modificata con successo', campaign });
  } catch (error) {
    res.status(500).json({ message: 'Errore nella modifica della campagna', error: error.message });
  }
});

// Elimina una campagna
router.delete('/campaigns/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campagna non trovata' });
    }

    await campaign.remove();
    res.status(200).json({ message: 'Campagna eliminata con successo' });
  } catch (error) {
    res.status(500).json({ message: 'Errore nell\'eliminazione della campagna', error: error.message });
  }
});

// Funzione per generare link univoco
const generateUniqueLink = (campaign, username) => {
  const randomValue = Math.random().toString(36).substr(2, 8);
  return `/cpc/${randomValue}?campaign=${campaign}&username=${username}`;
};

// Recupera tutte le richieste per un utente specifico
router.get('/user-campaign-requests/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const requests = await CampaignRequest.find({ 
      username: username 
    }).sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ 
      message: 'Errore nel recupero delle richieste', 
      error: error.message 
    });
  }
});

// Recupera tutte le richieste pending
router.get('/pending-requests', async (req, res) => {
  try {
    const requests = await CampaignRequest.find({ 
      status: 'PENDING' 
    }).sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ 
      message: 'Errore nel recupero delle richieste', 
      error: error.message 
    });
  }
});

// Aggiorna lo stato di una richiesta
router.patch('/update-request/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const request = await CampaignRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: 'Richiesta non trovata' });
    }

    const campaign = await Campaign.findOne({ name: request.campaign });

    if (!campaign) {
      return res.status(404).json({ message: 'Campagna non trovata' });
    }

    if (status === 'APPROVED') {
      const uniqueLink = generateUniqueLink(request.campaign, request.username);
      const realRedirectUrl = campaign.realUrl + request.username;

      request.status = status;
      request.uniqueLink = uniqueLink;
      request.realRedirectUrl = realRedirectUrl;
      request.updatedAt = Date.now();
    } else if (status === 'DEACTIVATED') {
      request.status = status;
      request.updatedAt = Date.now();
    } else {
      request.status = status;
      request.uniqueLink = null;
      request.realRedirectUrl = null;
      request.updatedAt = Date.now();
    }

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ 
      message: 'Errore nell\'aggiornamento della richiesta', 
      error: error.message 
    });
  }
});

module.exports = router;