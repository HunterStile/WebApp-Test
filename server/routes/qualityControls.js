const express = require('express');
const router = express.Router();
const QualityControl = require('../models/QualityControl');
const ExternalBatch = require('../models/ExternalBatch');
const mongoose = require('mongoose');

// Get all quality controls for a specific user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Verifica che l'userId sia valido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido o mancante' });
    }
    
    const qualityControls = await QualityControl.find({ userId })
      .populate('externalBatch')
      .sort({ controlDate: -1 });
    
    res.json(qualityControls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single quality control
router.get('/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Verifica che l'userId sia valido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido o mancante' });
    }
    
    const qualityControl = await QualityControl.findOne({
      _id: req.params.id,
      userId
    }).populate('externalBatch');
    
    if (!qualityControl) {
      return res.status(404).json({ message: 'Controllo qualità non trovato' });
    }
    
    res.json(qualityControl);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new quality control
router.post('/', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Verifica che l'userId sia valido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido o mancante' });
    }

    // Verifica che il lotto esterno esista e appartenga all'utente
    const externalBatch = await ExternalBatch.findOne({ 
      _id: req.body.externalBatch,
      userId
    });
    
    if (!externalBatch) {
      return res.status(400).json({ message: 'Lotto esterno non trovato o non appartiene a questo utente' });
    }
    
    // Verifica se esiste già un controllo con lo stesso numero di protocollo per questo utente
    const existingControl = await QualityControl.findOne({
      userId,
      protocolNumber: req.body.protocolNumber
    });
    
    if (existingControl) {
      return res.status(400).json({ message: 'Esiste già un controllo con questo numero di protocollo' });
    }

    // Verifica che la quantità non conforme non superi la quantità controllata
    if (req.body.nonConformingQuantity > req.body.checkedQuantity) {
      return res.status(400).json({ message: 'La quantità non conforme non può superare la quantità controllata' });
    }
    
    const qualityControl = new QualityControl({
      userId,
      controlDate: new Date(req.body.controlDate),
      protocolNumber: req.body.protocolNumber,
      externalBatch: req.body.externalBatch,
      checkedQuantity: req.body.checkedQuantity,
      nonConformingQuantity: req.body.nonConformingQuantity,
      dimensions: req.body.dimensions,
      notes: req.body.notes
    });

    const newQualityControl = await qualityControl.save();
    
    // Popola le informazioni del lotto esterno prima di inviare la risposta
    const populatedControl = await QualityControl.findById(newQualityControl._id)
      .populate('externalBatch');
    
    res.status(201).json(populatedControl);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a quality control
router.put('/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Verifica che l'userId sia valido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido o mancante' });
    }
    
    // Trova il controllo assicurandosi che appartenga all'utente
    const qualityControl = await QualityControl.findOne({
      _id: req.params.id,
      userId
    });
    
    if (!qualityControl) {
      return res.status(404).json({ message: 'Controllo qualità non trovato' });
    }
    
    // Se viene cambiato il lotto esterno, verifica che esista e appartenga all'utente
    if (req.body.externalBatch && req.body.externalBatch.toString() !== qualityControl.externalBatch.toString()) {
      const externalBatch = await ExternalBatch.findOne({ 
        _id: req.body.externalBatch,
        userId
      });
      
      if (!externalBatch) {
        return res.status(400).json({ message: 'Lotto esterno non trovato o non appartiene a questo utente' });
      }
    }
    
    // Se viene modificato il numero del protocollo, verifica che non sia già utilizzato
    if (req.body.protocolNumber && req.body.protocolNumber !== qualityControl.protocolNumber) {
      const existingWithProtocolNumber = await QualityControl.findOne({ 
        userId,
        protocolNumber: req.body.protocolNumber,
        _id: { $ne: qualityControl._id } // Escludi il controllo corrente
      });
      
      if (existingWithProtocolNumber) {
        return res.status(400).json({ message: 'Esiste già un controllo con questo numero di protocollo' });
      }
    }
    
    // Verifica che la quantità non conforme non superi la quantità controllata
    if (req.body.nonConformingQuantity && req.body.checkedQuantity) {
      if (req.body.nonConformingQuantity > req.body.checkedQuantity) {
        return res.status(400).json({ message: 'La quantità non conforme non può superare la quantità controllata' });
      }
    } else if (req.body.nonConformingQuantity && !req.body.checkedQuantity) {
      if (req.body.nonConformingQuantity > qualityControl.checkedQuantity) {
        return res.status(400).json({ message: 'La quantità non conforme non può superare la quantità controllata' });
      }
    } else if (!req.body.nonConformingQuantity && req.body.checkedQuantity) {
      if (qualityControl.nonConformingQuantity > req.body.checkedQuantity) {
        return res.status(400).json({ message: 'La quantità non conforme non può superare la quantità controllata' });
      }
    }

    // Aggiorna i campi
    if (req.body.controlDate) qualityControl.controlDate = new Date(req.body.controlDate);
    if (req.body.protocolNumber) qualityControl.protocolNumber = req.body.protocolNumber;
    if (req.body.externalBatch) qualityControl.externalBatch = req.body.externalBatch;
    if (req.body.checkedQuantity !== undefined) qualityControl.checkedQuantity = req.body.checkedQuantity;
    if (req.body.nonConformingQuantity !== undefined) qualityControl.nonConformingQuantity = req.body.nonConformingQuantity;
    if (req.body.dimensions !== undefined) qualityControl.dimensions = req.body.dimensions;
    if (req.body.notes !== undefined) qualityControl.notes = req.body.notes;
    
    const updatedQualityControl = await qualityControl.save();
    
    // Popola le informazioni del lotto esterno prima di inviare la risposta
    const populatedControl = await QualityControl.findById(updatedQualityControl._id)
      .populate('externalBatch');
    
    res.json(populatedControl);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a quality control
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Verifica che l'userId sia valido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido o mancante' });
    }
    
    // Trova il controllo assicurandosi che appartenga all'utente
    const qualityControl = await QualityControl.findOne({
      _id: req.params.id,
      userId
    });
    
    if (!qualityControl) {
      return res.status(404).json({ message: 'Controllo qualità non trovato' });
    }
    
    await QualityControl.findByIdAndDelete(req.params.id);
    res.json({ message: 'Controllo qualità eliminato' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 