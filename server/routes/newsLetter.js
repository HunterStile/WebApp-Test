// routes/newsletter.js
const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const NewsletterService = require('../services/NewsletterService');

// Crea una nuova newsletter
router.post('/', async (req, res) => {
  try {
    const { title, subject, content, language, scheduledAt, createdBy } = req.body;
    
    const newsletter = await NewsletterService.createNewsletter({
      title,
      subject,
      content,
      language,
      scheduledAt: scheduledAt || Date.now(),
      createdBy
    });

    res.status(201).json(newsletter);
  } catch (error) {
    res.status(500).json({ message: 'Errore nella creazione della newsletter', error: error.message });
  }
});

// Invia una newsletter
router.post('/:id/send', async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);
    
    if (!newsletter) {
      return res.status(404).json({ message: 'Newsletter non trovata' });
    }

    const results = await NewsletterService.sendNewsletter(newsletter);

    res.json({
      message: 'Newsletter inviata',
      results
    });
  } catch (error) {
    res.status(500).json({ message: 'Errore nell\'invio della newsletter', error: error.message });
  }
});

// Lista newsletter
router.get('/', async (req, res) => {
  try {
    const newsletters = await Newsletter.find()
      .sort({ createdAt: -1 });
    res.json(newsletters);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero delle newsletter', error: error.message });
  }
});

module.exports = router;