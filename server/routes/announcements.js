// routes/announcements.js
const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// Crea nuovo annuncio (solo admin)
router.post('/', async (req, res) => {
  const { title, content, priority } = req.body;
  
  try {
    const announcement = await Announcement.create({
      title,
      content,
      priority
    });
    
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Errore nella creazione dell\'annuncio' });
  }
});

// Ottieni tutti gli annunci attivi
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero degli annunci' });
  }
});

// Ottieni tutti gli annunci (admin)
router.get('/admin', async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero degli annunci' });
  }
});

// Disattiva/riattiva annuncio (admin)
router.patch('/:id/toggle', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    announcement.isActive = !announcement.isActive;
    await announcement.save();
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Errore nella modifica dello stato dell\'annuncio' });
  }
});

module.exports = router;