// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const emailService = require('../services/emailService');

// Rotta pubblica per l'invio del messaggio di contatto
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nome, email e messaggio sono richiesti' 
      });
    }

    // Crea il nuovo contatto
    const contact = await Contact.create({
      name,
      email,
      message,
      status: 'new'
    });

    // Invia email di conferma al cliente
    await emailService.sendContactConfirmation(email, name);
    
    // Invia notifica agli admin
    await emailService.sendAdminNotification(contact);

    res.status(201).json({ 
      success: true, 
      message: 'Messaggio inviato con successo' 
    });

  } catch (error) {
    console.error('Errore nella creazione del contatto:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Errore interno del server' 
    });
  }
});

// Get tutti i contatti (con paginazione)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments();

    res.json({
      success: true,
      data: contacts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });

  } catch (error) {
    console.error('Errore nel recupero dei contatti:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Errore interno del server' 
    });
  }
});

// Ricerca contatti per email
router.get('/search', async (req, res) => {
  try {
    const { email } = req.query;
    
    const query = email ? 
      { email: { $regex: email, $options: 'i' } } : 
      {};

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: contacts
    });

  } catch (error) {
    console.error('Errore nella ricerca dei contatti:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Errore interno del server' 
    });
  }
});

// Risposta a un contatto
router.post('/respond/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ 
        success: false, 
        error: 'La risposta è richiesta' 
      });
    }

    const contact = await Contact.findById(id);
    
    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        error: 'Contatto non trovato' 
      });
    }

    // Aggiorna il contatto
    contact.responses.push({
      message: response,
      createdAt: new Date()
    });
    
    contact.status = 'inProgress';
    await contact.save();

    // Invia la risposta via email
    await emailService.sendResponseEmail(
      contact.email,
      contact.name,
      response
    );

    res.json({
      success: true,
      message: 'Risposta inviata con successo'
    });

  } catch (error) {
    console.error('Errore nell\'invio della risposta:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Errore interno del server' 
    });
  }
});

// Aggiorna lo stato di un contatto
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'inProgress', 'resolved'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Stato non valido' 
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        error: 'Contatto non trovato' 
      });
    }

    res.json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error('Errore nell\'aggiornamento dello stato:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Errore interno del server' 
    });
  }
});

module.exports = router;