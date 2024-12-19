const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// **Utenti**
// Recupera i messaggi ricevuti dall'utente loggato
router.get('/', async (req, res) => {
  const { username } = req.query;

  try {
    const messages = await Message.find({ receiver: username }).sort({ timestamp: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero dei messaggi' });
  }
});

// Invia un messaggio dall'utente
router.post('/', async (req, res) => {
  const { sender, receiver, subject, content } = req.body;

  try {
    const newMessage = await Message.create({ sender, receiver, subject, content });
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Errore nell\'invio del messaggio' });
  }
});

// **Admin**
// Recupera tutti i messaggi di tutti gli utenti
router.get('/admin', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero dei messaggi' });
  }
});

// Invia un nuovo messaggio come admin
router.post('/admin', async (req, res) => {
  const { receiver, subject, content } = req.body;

  try {
    const newMessage = await Message.create({
      sender: 'admin',
      receiver,
      subject,
      content,
    });
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Errore nell\'invio del messaggio' });
  }
});

// Risponde a un messaggio specifico
router.put('/admin/:id', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: 'Messaggio non trovato' });

    const reply = await Message.create({
      sender: 'admin',
      receiver: message.sender,
      subject: `RE: ${message.subject}`,
      content,
    });

    res.status(200).json(reply);
  } catch (error) {
    res.status(500).json({ message: 'Errore nella risposta al messaggio' });
  }
});


router.get('/sent', async (req, res) => {
    const { username } = req.query;
    try {
      const messages = await Message.find({ sender: username }).sort({ timestamp: -1 });
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Errore nel recupero dei messaggi inviati' });
    }
  });
  
module.exports = router;
