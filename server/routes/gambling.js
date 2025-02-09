// routes/gambling.js
const express = require('express');
const axios = require('axios');
const Conversion = require('../models/Conversion');
const Campaign = require('../models/Campaign');
const Payment = require('../models/Payment');
const User = require('../models/User');
const router = express.Router();

router.get('/fetch-conversions', async (req, res) => {
  try {
    const apiKey = '9XQPzYXpBwSCZ1xakP1r8-Uy';
    const apiUrl = `https://api.gambling-affiliation.com/aff/v1/${apiKey}/report/conversion`;

    // Calcola date per gli ultimi 5 mesi
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 5);

    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];

    console.log(`Fetching conversions from ${formattedStartDate} to ${formattedEndDate}`);

    // Recupera tutte le campagne che richiedono rimappatura
    const mappingCampaigns = await Campaign.find({
      requiresMapping: true
    }, 'name mappedName commissionAdjustment');

    // Crea l'oggetto di mappatura
    const campaignNameMapping = mappingCampaigns.reduce((acc, campaign) => {
      if (campaign.mappedName) {
        acc[campaign.name] = campaign.mappedName;
      }
      return acc;
    }, {});

    const response = await axios.get(apiUrl, {
      params: {
        sites: [83638, 82703, 82990],
        campaigns: ['active', 'offline'],
        period: 'custom',
        start: formattedStartDate,
        end: formattedEndDate,
        type: [1, 2, 3, 4, 5],
        status: [0, 1, 2, 3],
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

    // Usa la mappatura nelle conversioni
    const conversions = response.data.conversions.map(conv => {
      // Trova la campagna corrispondente
      const campaign = mappingCampaigns.find(c =>
        c.name === conv.campaign_name || c.mappedName === conv.campaign_name
      );

      // Usa la mappatura dal database
      const mappedCampaignName = campaignNameMapping[conv.campaign_name] || conv.campaign_name;

      return {
        conversion_id: conv.conversion_id,
        campaign_name: mappedCampaignName,
        original_campaign_name: conv.campaign_name,
        site_url: conv.site_url,
        date: new Date(conv.date),
        type: conv.type,
        tracking: conv.tracking,
        aff_var: conv.aff_var,
        netrevenue: conv.netrevenue ? parseFloat(conv.netrevenue) : null,
        commission: parseFloat(conv.commission), // Manteniamo la commissione originale per ora
        original_commission: conv.commission,
        adjustment_applied: 0, // Default a 0
        payment: conv.payment,
        status: conv.status,
        campaign_status: conv.campaign_status
      };
    });

    // Usa upsert per evitare duplicati con logica di status personalizzata
    const bulkOps = conversions.map(async (conv) => {
      // Cerca la conversione esistente
      const existingConversion = await Conversion.findOne({ conversion_id: conv.conversion_id });

      // Determina lo status da salvare
      let statusToSave = conv.status;
      let finalCommission = parseFloat(conv.commission);
      let adjustmentApplied = 0;

      if (existingConversion) {
        // Se la conversione esiste, mantieni la commissione originale
        finalCommission = parseFloat(existingConversion.commission);
        adjustmentApplied = existingConversion.adjustment_applied;

        // Logica per lo status
        if (existingConversion.status === 'validated') {
          statusToSave = existingConversion.status;
        }
        if (existingConversion.status === 'paid') {
          statusToSave = existingConversion.status;
        }

        if (existingConversion.status === 'onhold' && conv.status === 'paid') {
          statusToSave = 'validated';
        }
        
        if (existingConversion.status === 'refused') {
          statusToSave = 'refused';
        }
      } else {
        // Solo per nuove conversioni, applica l'adjustment
        const campaign = mappingCampaigns.find(c =>
          c.name === conv.original_campaign_name || c.mappedName === conv.original_campaign_name
        );
        
        if (campaign && campaign.commissionAdjustment) {
          finalCommission -= campaign.commissionAdjustment;
          finalCommission = Math.max(0, finalCommission);
          adjustmentApplied = campaign.commissionAdjustment;
        }

        // Per nuove conversioni, se arriva 'paid', imposta a 'validated'
        if (conv.status === 'paid') {
          statusToSave = 'validated';
        }
      }

      // Aggiorna con lo status determinato e la commissione appropriata
      return {
        updateOne: {
          filter: { conversion_id: conv.conversion_id },
          update: {
            ...conv,
            status: statusToSave,
            commission: finalCommission.toFixed(2),
            adjustment_applied: adjustmentApplied
          },
          upsert: true
        }
      };
    });

    // Esegui le operazioni di bulk write
    const bulkWriteOps = await Promise.all(bulkOps);
    const result = await Conversion.bulkWrite(bulkWriteOps);

    res.json({
      message: 'Conversioni salvate con successo',
      count: conversions.length,
      upsertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    // Gestione errori...
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
    const { aff_var, status, campaign_name, type, startDate, endDate } = req.query;

    // Costruisci filtro dinamico
    const filter = {};
    if (aff_var) filter.aff_var = aff_var; // Filtra per aff_var (username)
    if (status) filter.status = status;
    if (campaign_name) filter.campaign_name = { $regex: campaign_name, $options: 'i' };
    if (type) filter.type = type;

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const conversions = await Conversion.find(filter).sort({ date: -1 }).limit(100);
    res.json({
      total: await Conversion.countDocuments(filter),
      conversions,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Errore nel recupero conversioni',
      details: error.message,
    });
  }
});

router.get('/all-conversions', async (req, res) => {
  try {
    const { aff_var, status, campaign_name, type, startDate, endDate } = req.query;
    const { page = 1, limit = 10 } = req.query; // Default valori
    const skip = (page - 1) * limit;

    // Costruisci filtro dinamico
    const filter = {};
    if (aff_var) filter.aff_var = aff_var; // Filtra per aff_var (username)
    if (status) filter.status = status;
    if (campaign_name) filter.campaign_name = { $regex: campaign_name, $options: 'i' };
    if (type) filter.type = type;

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const conversions = await Conversion.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Conversion.countDocuments(filter);

    res.json({
      total,
      conversions,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Errore nel recupero conversioni',
      details: error.message,
    });
  }
});


// In routes/gambling.js, add this route:
router.get('/user-commissions/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Find the user to get payment method
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    // Find validated conversions for the specific user
    const validatedCommissions = await Conversion.aggregate([
      {
        $match: {
          aff_var: username,
          status: 'validated'
        }
      },
      {
        $group: {
          _id: null,
          total_commission: { $sum: { $toDouble: '$commission' } },
          total_conversions: { $sum: 1 }
        }
      }
    ]);

    const result = validatedCommissions[0] || {
      total_commission: 0,
      total_conversions: 0
    };

    res.json({
      username,
      payment_method: user.paymentMethod,
      payment_address: user.paymentMethod === 'paypal' ? user.paypalAddress : user.bitcoinAddress,
      total_validated_commission: result.total_commission.toFixed(2),
      validated_conversions_count: result.total_conversions
    });
  } catch (error) {
    res.status(500).json({
      error: 'Errore nel calcolo delle commissioni',
      details: error.message
    });
  }
});

// Modify the mark-conversions-paid route
router.post('/mark-conversions-paid', async (req, res) => {
  try {
    const { username, amount } = req.body;

    // Find the user to get payment method
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    // Update validated conversions to paid status for this user
    const result = await Conversion.updateMany(
      {
        aff_var: username,
        status: 'validated'
      },
      {
        $set: { status: 'paid' }
      }
    );

    // Create a payment record
    const payment = new Payment({
      username,
      amount,
      currency: 'EUR', // You might want to make this more dynamic
      method: user.paymentMethod === 'paypal' ? 'PayPal' : 'BTC',
      timestamp: new Date()
    });
    await payment.save();

    res.json({
      message: 'Conversioni marcate come pagate',
      updatedCount: result.modifiedCount,
      payment_method: user.paymentMethod,
      payment_address: user.paymentMethod === 'paypal' ? user.paypalAddress : user.bitcoinAddress
    });
  } catch (error) {
    res.status(500).json({
      error: 'Errore nel marcare le conversioni come pagate',
      details: error.message
    });
  }
});

// Add this route to routes/gambling.js
router.get('/user-payment-list', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'username', 
      sortOrder = 'asc',
      minValidatedCommissions,
      minTotalPayments,
      validatedCommissionsSortOrder,
      totalPaymentsSortOrder
    } = req.query;
    const skip = (page - 1) * limit;

    // Base aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: 'conversions',
          let: { username: '$username' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$aff_var', '$$username'] },
                    { $eq: ['$status', 'validated'] }
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                totalValidatedCommissions: { $sum: { $toDouble: '$commission' } },
                validatedConversionsCount: { $sum: 1 }
              }
            }
          ],
          as: 'validatedCommissions'
        }
      },
      {
        $lookup: {
          from: 'payments',
          let: { username: '$username' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$username', '$$username'] }
              }
            },
            {
              $group: {
                _id: null,
                totalPayments: { $sum: '$amount' }
              }
            }
          ],
          as: 'payments'
        }
      },
      {
        $project: {
          username: 1,
          paymentMethod: 1,
          email: 1,
          totalValidatedCommissions: { 
            $ifNull: [{ $arrayElemAt: ['$validatedCommissions.totalValidatedCommissions', 0] }, 0] 
          },
          totalPayments: { 
            $ifNull: [{ $arrayElemAt: ['$payments.totalPayments', 0] }, 0] 
          }
        }
      }
    ];

    // Add filtering conditions if specified
    if (minValidatedCommissions || minTotalPayments) {
      const matchStage = { $match: {} };
      
      if (minValidatedCommissions) {
        matchStage.$match.totalValidatedCommissions = { 
          $gte: parseFloat(minValidatedCommissions) 
        };
      }
      
      if (minTotalPayments) {
        matchStage.$match.totalPayments = { 
          $gte: parseFloat(minTotalPayments) 
        };
      }
      
      pipeline.push(matchStage);
    }

    // Add sorting stages
    const sortStages = [];

    // Main sort
    const mainSortStage = { $sort: {} };
    mainSortStage.$sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    sortStages.push(mainSortStage);

    // Additional sorting for validated commissions
    if (validatedCommissionsSortOrder) {
      const validatedCommissionsSortStage = { 
        $sort: { 
          totalValidatedCommissions: validatedCommissionsSortOrder === 'asc' ? 1 : -1 
        } 
      };
      sortStages.push(validatedCommissionsSortStage);
    }

    // Additional sorting for total payments
    if (totalPaymentsSortOrder) {
      const totalPaymentsSortStage = { 
        $sort: { 
          totalPayments: totalPaymentsSortOrder === 'asc' ? 1 : -1 
        } 
      };
      sortStages.push(totalPaymentsSortStage);
    }

    // Add sort stages to pipeline
    pipeline.push(...sortStages);

    // Execute aggregation
    const userList = await User.aggregate(pipeline);

    // Pagination
    const totalUsers = userList.length;
    const paginatedUsers = userList.slice(skip, skip + Number(limit));

    res.json({
      total: totalUsers,
      users: paginatedUsers,
      totalPages: Math.ceil(totalUsers / limit)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Errore nel recupero della lista utenti',
      details: error.message
    });
  }
});

module.exports = router;