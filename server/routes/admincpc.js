const express = require('express');
const router = express.Router();
const CampaignRequest = require('../models/CampaignRequest');

// Mappa delle campagne con gli URL reali
const campaignUrls = {
  BETANO: 'https://www.gambling-affiliation.com/cpc/v=g5MTrVQ96U0IQlw1NeFO-hIm1W43ZmVn0.gSTfMxo2s_GA7331V2&aff_var_1=',
  ROLLETTO: 'https://www.gambling-affiliation.com/cpc/v=CDv-VvGTatah4ZD6IPtEqcDZjnem9BRZ3z2oz1PDuhg_GA7331V2&aff_var_1=',
  TIKIAKA: 'https://www.gambling-affiliation.com/cpc/v=WD9KR0uuFFaj9029..91PF4Kwbtu9Re0s6ZO6fobNIk_GA7331V2&aff_var_1=',
  CAZEURS: 'https://www.gambling-affiliation.com/cpc/v=Xb75XCL1vA3pLoGQnEc6OtsmD1AFzUlVf2Rm5zd.DwM_GA7331V2&aff_var_1=',
};

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

    // Genera link univoco se approvato
    if (status === 'APPROVED') {
      const uniqueLink = generateUniqueLink(request.campaign, request.username);
      const realRedirectUrl = campaignUrls[request.campaign] + request.username;

      request.status = status;
      request.uniqueLink = uniqueLink;
      request.realRedirectUrl = realRedirectUrl;
    } else {
      request.status = status;
    }

    request.updatedAt = Date.now();
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