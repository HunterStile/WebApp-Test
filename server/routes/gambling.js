// routes/gambling.js
const express = require('express');
const axios = require('axios');
const Conversion = require('../models/Conversion');
const router = express.Router();

router.get('/fetch-conversions', async (req, res) => {
    try {
      const apiKey = '9XQPzYXpBwSCZ1xakP1r8-Uy'; 
      const apiUrl = `https://api.gambling-affiliation.com/aff/v1/${apiKey}/report/conversion`;
      
      // Calcola date per gli ultimi 6 mesi
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
  
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
  
      console.log(`Fetching conversions from ${formattedStartDate} to ${formattedEndDate}`);
  
      const response = await axios.get(apiUrl, {
        params: {
          sites: [83638, 82703, 82990],
          campaigns: ['active'],
          period: 'custom',
          start: formattedStartDate,
          end: formattedEndDate,
          type: [1,2,3,4,5],
          status: [0,1,2,3],
          order_by: 'c.id',
          order_direction: 'DESC',
          columns: [
            'id_cpx', 
            'campaign', 
            'url', 
            'date', 
            'type', 
            'tracking', 
            'aff_var', 
            'nr', 
            'aff_com', 
            'payment', 
            'status'
          ]
        }
      });
  
      console.log('Risposta API completa:', JSON.stringify(response.data, null, 2));
  
      // Salva conversioni in MongoDB
      const conversions = response.data.conversions.map(conv => ({
        conversion_id: conv.conversion_id,
        campaign_name: conv.campaign_name,
        site_url: conv.site_url,
        date: new Date(conv.date),
        type: conv.type,
        tracking: conv.tracking,
        aff_var: conv.aff_var,
        netrevenue: conv.netrevenue ? parseFloat(conv.netrevenue) : null,
        commission: conv.commission,
        payment: conv.payment,
        status: conv.status,
        campaign_status: conv.campaign_status
      }));
  
      // Usa upsert per evitare duplicati
      const bulkOps = conversions.map(conv => ({
        updateOne: {
          filter: { conversion_id: conv.conversion_id },
          update: conv,
          upsert: true
        }
      }));
  
      const result = await Conversion.bulkWrite(bulkOps);
  
      res.json({ 
        message: 'Conversioni salvate con successo', 
        count: conversions.length,
        upsertedCount: result.upsertedCount,
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      // Gestione specifica dell'errore di rate limit
      if (error.response && error.response.data && error.response.data.error) {
        const apiError = error.response.data.error;
        
        if (apiError.code === 'application.api.affiliate.ratelimit') {
          console.error('Rate limit raggiunto:', apiError.message);
          return res.status(429).json({
            error: 'Rate limit raggiunto',
            retryAfter: apiError.message.split('on :')[1]?.trim() || 'Prossimo tentativo non specificato'
          });
        }
      }
  
      console.error('Errore nel fetch conversioni:', error.response ? error.response.data : error.message);
      res.status(500).json({ 
        error: 'Impossibile recuperare le conversioni',
        details: error.response ? error.response.data : error.message
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