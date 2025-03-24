const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const mongoose = require('mongoose');

// Get all customers for a specific user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Verifica che l'userId sia valido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido o mancante' });
    }
    
    const customers = await Customer.find({ userId }).sort({ name: 1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single customer (with user verification)
router.get('/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Verifica che l'userId sia valido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido o mancante' });
    }
    
    const customer = await Customer.findOne({ 
      _id: req.params.id,
      userId
    });
    
    if (!customer) {
      return res.status(404).json({ message: 'Cliente non trovato' });
    }
    
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new customer
router.post('/', async (req, res) => {
  try {
    const { userId, vatId, name, address, zipCode, city, phone } = req.body;
    
    // Verifica che l'userId sia valido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido o mancante' });
    }
    
    // Verifica se esiste già un cliente con la stessa partita IVA per questo utente
    const existingCustomer = await Customer.findOne({ userId, vatId });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Esiste già un cliente con questa partita IVA' });
    }
    
    const customer = new Customer({
      userId,
      vatId,
      name,
      address,
      zipCode,
      city,
      phone
    });

    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a customer (with user verification)
router.put('/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Verifica che l'userId sia valido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido o mancante' });
    }
    
    // Trova il cliente assicurandosi che appartenga all'utente
    const customer = await Customer.findOne({ 
      _id: req.params.id,
      userId
    });
    
    if (!customer) {
      return res.status(404).json({ message: 'Cliente non trovato' });
    }

    // Se viene modificata la partita IVA, verifica che non sia già utilizzata
    if (req.body.vatId && req.body.vatId !== customer.vatId) {
      const existingWithVatId = await Customer.findOne({ 
        userId, 
        vatId: req.body.vatId,
        _id: { $ne: customer._id } // Escludi il cliente corrente
      });
      
      if (existingWithVatId) {
        return res.status(400).json({ message: 'Esiste già un cliente con questa partita IVA' });
      }
    }

    // Aggiorna i campi
    if (req.body.vatId) customer.vatId = req.body.vatId;
    if (req.body.name) customer.name = req.body.name;
    if (req.body.address) customer.address = req.body.address;
    if (req.body.zipCode) customer.zipCode = req.body.zipCode;
    if (req.body.city) customer.city = req.body.city;
    if (req.body.phone) customer.phone = req.body.phone;
    
    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a customer (with user verification)
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Verifica che l'userId sia valido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido o mancante' });
    }
    
    // Trova il cliente assicurandosi che appartenga all'utente
    const customer = await Customer.findOne({ 
      _id: req.params.id,
      userId
    });
    
    if (!customer) {
      return res.status(404).json({ message: 'Cliente non trovato' });
    }
    
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cliente eliminato' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 