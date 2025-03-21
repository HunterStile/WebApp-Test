const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single supplier
router.get('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new supplier
router.post('/', async (req, res) => {
  const supplier = new Supplier({
    vatId: req.body.vatId,
    name: req.body.name,
    address: req.body.address,
    phone: req.body.phone
  });

  try {
    const newSupplier = await supplier.save();
    res.status(201).json(newSupplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a supplier
router.put('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

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

// Delete a supplier
router.delete('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supplier deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 