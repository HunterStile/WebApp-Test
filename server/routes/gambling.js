// routes/gambling.js
const express = require('express');
const axios = require('axios');
const Conversion = require('../models/Conversion');
const router = express.Router();

// Rotta per fetchare e salvare conversioni
router.get('/fetch-conversions', async (req, res) => {
  try {
    const apiKey = process.env.GAMBLING_API_KEY; // Aggiungi questa variabile nel .env
    const apiUrl = 'https://api.gambling-affiliation.com/aff/v1/your-unique-path/report/conversion';
    
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      params: {
        sites: [83638, 82703, 82990],
        campaigns: ['active'],
        period: 'custom',
        start: '2024-11-01',
        end: '2024-12-31'
      }
    });

    // Salva conversioni in MongoDB
    const conversions = response.data.conversions.map(conv => ({
      ...conv,
      date: new Date(conv.date),
      netrevenue: conv.netrevenue ? parseFloat(conv.netrevenue) : null
    }));

    // Usa upsert per evitare duplicati
    const bulkOps = conversions.map(conv => ({
      updateOne: {
        filter: { conversion_id: conv.conversion_id },
        update: conv,
        upsert: true
      }
    }));

    await Conversion.bulkWrite(bulkOps);

    res.json({ 
      message: 'Conversioni salvate con successo', 
      count: conversions.length 
    });
  } catch (error) {
    console.error('Errore nel fetch conversioni:', error);
    res.status(500).json({ 
      error: 'Impossibile recuperare le conversioni',
      details: error.message 
    });
  }
});

// Rotta per ottenere conversioni con filtri
router.get('/conversions', async (req, res) => {
  try {
    const { 
      status, 
      campaign_name, 
      type, 
      startDate, 
      endDate 
    } = req.query;

    // Costruisci filtro dinamico
    const filter = {};
    if (status) filter.status = status;
    if (campaign_name) filter.campaign_name = { $regex: campaign_name, $options: 'i' };
    if (type) filter.type = type;
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const conversions = await Conversion
      .find(filter)
      .sort({ date: -1 })
      .limit(100); // Limita a 100 risultati per default

    res.json({
      total: await Conversion.countDocuments(filter),
      conversions
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nel recupero conversioni',
      details: error.message 
    });
  }
});

// Rotta per statistiche aggregate
router.get('/stats', async (req, res) => {
  try {
    const stats = await Conversion.aggregate([
      {
        $group: {
          _id: {
            status: '$status',
            type: '$type',
            campaign: '$campaign_name'
          },
          total_conversions: { $sum: 1 },
          total_commission: { $sum: { $toDouble: '$commission' } }
        }
      },
      { $sort: { total_conversions: -1 } }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nel calcolo statistiche',
      details: error.message 
    });
  }
});

module.exports = router;