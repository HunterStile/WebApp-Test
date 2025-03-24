const express = require('express');
const router = express.Router();
const ExternalBatch = require('../models/ExternalBatch');
const Supplier = require('../models/Supplier');
const mongoose = require('mongoose');

// Get all external batches with populated supplier info for a specific user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Verifica che l'userId sia valido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido o mancante' });
    }
    
    const externalBatches = await ExternalBatch.find({ userId })
      .populate('foodDetails.supplier')
      .sort({ acceptanceDate: -1 });
    res.json(externalBatches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single external batch (with user verification)
router.get('/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Verifica che l'userId sia valido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido o mancante' });
    }
    
    const externalBatch = await ExternalBatch.findOne({
      _id: req.params.id,
      userId
    }).populate('foodDetails.supplier');
    
    if (!externalBatch) {
      return res.status(404).json({ message: 'Lotto esterno non trovato' });
    }
    res.json(externalBatch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new external batch
router.post('/', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Verifica che l'userId sia valido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido o mancante' });
    }
    
    // Validate supplier exists and belongs to the user
    const supplier = await Supplier.findOne({ 
      _id: req.body.foodDetails.supplier,
      userId
    });
    
    if (!supplier) {
      return res.status(400).json({ message: 'Fornitore non trovato o non appartiene a questo utente' });
    }
    
    // Verifica se esiste già un lotto con lo stesso numero per questo utente
    const existingBatch = await ExternalBatch.findOne({ 
      userId,
      batchNumber: req.body.batchNumber
    });
    
    if (existingBatch) {
      return res.status(400).json({ message: 'Esiste già un lotto con questo numero' });
    }

    const externalBatch = new ExternalBatch({
      userId,
      acceptanceDate: new Date(req.body.acceptanceDate),
      batchNumber: req.body.batchNumber,
      ddtDate: new Date(req.body.ddtDate),
      ddtNumber: req.body.ddtNumber,
      origin: req.body.origin,
      foodDetails: {
        foodName: req.body.foodDetails.foodName,
        unitOfMeasure: req.body.foodDetails.unitOfMeasure,
        quantity: req.body.foodDetails.quantity,
        expirationDate: new Date(req.body.foodDetails.expirationDate),
        supplier: req.body.foodDetails.supplier
      }
    });

    const newExternalBatch = await externalBatch.save();
    
    // Populate the supplier info before sending the response
    const populatedBatch = await ExternalBatch.findById(newExternalBatch._id)
      .populate('foodDetails.supplier');
    
    res.status(201).json(populatedBatch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an external batch (with user verification)
router.put('/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Verifica che l'userId sia valido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido o mancante' });
    }
    
    // Trova il lotto assicurandosi che appartenga all'utente
    const externalBatch = await ExternalBatch.findOne({
      _id: req.params.id,
      userId
    });
    
    if (!externalBatch) {
      return res.status(404).json({ message: 'Lotto esterno non trovato' });
    }

    // Validate supplier exists and belongs to the user if it's being updated
    if (req.body.foodDetails && req.body.foodDetails.supplier) {
      const supplier = await Supplier.findOne({ 
        _id: req.body.foodDetails.supplier,
        userId
      });
      
      if (!supplier) {
        return res.status(400).json({ message: 'Fornitore non trovato o non appartiene a questo utente' });
      }
    }
    
    // Se viene modificato il numero del lotto, verifica che non sia già utilizzato
    if (req.body.batchNumber && req.body.batchNumber !== externalBatch.batchNumber) {
      const existingWithBatchNumber = await ExternalBatch.findOne({ 
        userId,
        batchNumber: req.body.batchNumber,
        _id: { $ne: externalBatch._id } // Escludi il lotto corrente
      });
      
      if (existingWithBatchNumber) {
        return res.status(400).json({ message: 'Esiste già un lotto con questo numero' });
      }
    }

    // Update fields
    if (req.body.acceptanceDate) externalBatch.acceptanceDate = new Date(req.body.acceptanceDate);
    if (req.body.batchNumber) externalBatch.batchNumber = req.body.batchNumber;
    if (req.body.ddtDate) externalBatch.ddtDate = new Date(req.body.ddtDate);
    if (req.body.ddtNumber) externalBatch.ddtNumber = req.body.ddtNumber;
    if (req.body.origin) externalBatch.origin = req.body.origin;
    
    // Update food details if provided
    if (req.body.foodDetails) {
      if (req.body.foodDetails.foodName) externalBatch.foodDetails.foodName = req.body.foodDetails.foodName;
      if (req.body.foodDetails.unitOfMeasure) externalBatch.foodDetails.unitOfMeasure = req.body.foodDetails.unitOfMeasure;
      if (req.body.foodDetails.quantity) externalBatch.foodDetails.quantity = req.body.foodDetails.quantity;
      if (req.body.foodDetails.expirationDate) externalBatch.foodDetails.expirationDate = new Date(req.body.foodDetails.expirationDate);
      if (req.body.foodDetails.supplier) externalBatch.foodDetails.supplier = req.body.foodDetails.supplier;
    }
    
    const updatedExternalBatch = await externalBatch.save();
    
    // Populate the supplier info before sending the response
    const populatedBatch = await ExternalBatch.findById(updatedExternalBatch._id)
      .populate('foodDetails.supplier');
    
    res.json(populatedBatch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an external batch (with user verification)
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Verifica che l'userId sia valido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido o mancante' });
    }
    
    // Trova il lotto assicurandosi che appartenga all'utente
    const externalBatch = await ExternalBatch.findOne({
      _id: req.params.id,
      userId
    });
    
    if (!externalBatch) {
      return res.status(404).json({ message: 'Lotto esterno non trovato' });
    }
    
    await ExternalBatch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lotto esterno eliminato' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 