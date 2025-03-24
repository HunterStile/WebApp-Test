const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const mongoose = require('mongoose');

// Get all suppliers for a specific user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Verifica che l'userId sia valido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido o mancante' });
    }
    
    const suppliers = await Supplier.find({ userId }).sort({ name: 1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single supplier (with user verification)
router.get('/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Verifica che l'userId sia valido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido o mancante' });
    }
    
    const supplier = await Supplier.findOne({ 
      _id: req.params.id,
      userId
    });
    
    if (!supplier) {
      return res.status(404).json({ message: 'Fornitore non trovato' });
    }
    
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new supplier
router.post('/', async (req, res) => {
  try {
    const { userId, vatId, name, address, phone } = req.body;
    
    // Verifica che l'userId sia valido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido o mancante' });
    }
    
    // Verifica se esiste già un fornitore con la stessa partita IVA per questo utente
    const existingSupplier = await Supplier.findOne({ userId, vatId });
    if (existingSupplier) {
      return res.status(400).json({ message: 'Esiste già un fornitore con questa partita IVA' });
    }
    
    const supplier = new Supplier({
      userId,
      vatId,
      name,
      address,
      phone
    });

    const newSupplier = await supplier.save();
    res.status(201).json(newSupplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a supplier (with user verification)
router.put('/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Verifica che l'userId sia valido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido o mancante' });
    }
    
    // Trova il fornitore assicurandosi che appartenga all'utente
    const supplier = await Supplier.findOne({ 
      _id: req.params.id,
      userId
    });
    
    if (!supplier) {
      return res.status(404).json({ message: 'Fornitore non trovato' });
    }

    // Se viene modificata la partita IVA, verifica che non sia già utilizzata
    if (req.body.vatId && req.body.vatId !== supplier.vatId) {
      const existingWithVatId = await Supplier.findOne({ 
        userId, 
        vatId: req.body.vatId,
        _id: { $ne: supplier._id } // Escludi il fornitore corrente
      });
      
      if (existingWithVatId) {
        return res.status(400).json({ message: 'Esiste già un fornitore con questa partita IVA' });
      }
    }

    // Aggiorna i campi
    if (req.body.vatId) supplier.vatId = req.body.vatId;
    if (req.body.name) supplier.name = req.body.name;
    if (req.body.address) supplier.address = req.body.address;
    if (req.body.phone) supplier.phone = req.body.phone;
    
    const updatedSupplier = await supplier.save();
    res.json(updatedSupplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a supplier (with user verification)
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Verifica che l'userId sia valido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido o mancante' });
    }
    
    // Trova il fornitore assicurandosi che appartenga all'utente
    const supplier = await Supplier.findOne({ 
      _id: req.params.id,
      userId
    });
    
    if (!supplier) {
      return res.status(404).json({ message: 'Fornitore non trovato' });
    }
    
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fornitore eliminato' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 