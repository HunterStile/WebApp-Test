// routes/threads.js
const express = require('express');
const router = express.Router();
const Thread = require('../models/Thread');
const Message = require('../models/Message');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Crea nuovo thread
router.post('/', async (req, res) => {
  const { creator, subject, content, isAdminCreated, targetUser } = req.body;

  try {
    const thread = await Thread.create({
      creator,
      subject,
      isAdminCreated: isAdminCreated || false,
      targetUser: targetUser || creator
    });

    await Message.create({
      threadId: thread._id,
      sender: isAdminCreated ? 'admin' : creator,
      content,
      isAdminMessage: isAdminCreated || false
    });

    // Se il thread è creato dall'admin, invia email all'utente
    if (isAdminCreated) {
      const user = await User.findOne({ username: targetUser });
      if (user) {
        try {
          await emailService.sendAdminThreadCreationEmail(user, thread);
        } catch (emailError) {
          console.error('Errore invio email di aggiornamento:', emailError);
        }
      }
    }

    res.status(201).json(thread);
  } catch (error) {
    res.status(500).json({ message: 'Errore nella creazione del thread' });
  }
});

// Ottieni thread per utente
router.get('/user/:username', async (req, res) => {
  try {
    const threads = await Thread.find({ creator: req.params.username })
      .sort({ lastActivity: -1 });

    // Aggiungi l'ultimo messaggio a ogni thread
    const threadsWithLastMessage = await Promise.all(threads.map(async (thread) => {
      const lastMessage = await Message.findOne({ threadId: thread._id })
        .sort({ timestamp: -1 });
      return {
        ...thread.toObject(),
        lastMessage
      };
    }));

    res.json(threadsWithLastMessage);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero dei thread' });
  }
});

// Ottieni tutti i thread (admin)
router.get('/admin', async (req, res) => {
  try {
    const threads = await Thread.find()
      .sort({ lastActivity: -1 });

    const threadsWithDetails = await Promise.all(threads.map(async (thread) => {
      const lastMessage = await Message.findOne({ threadId: thread._id })
        .sort({ timestamp: -1 });
      const messageCount = await Message.countDocuments({ threadId: thread._id });

      return {
        ...thread.toObject(),
        lastMessage,
        messageCount
      };
    }));

    res.json(threadsWithDetails);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero dei thread' });
  }
});

// Chiudi/riapri thread (admin)
router.patch('/:threadId/toggle-status', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.threadId);
    thread.isOpen = !thread.isOpen;
    await thread.save();
    res.json(thread);
  } catch (error) {
    res.status(500).json({ message: 'Errore nella modifica dello stato del thread' });
  }
});

// Ottieni messaggi di un thread
router.get('/:threadId/messages', async (req, res) => {
  try {
    const messages = await Message.find({ threadId: req.params.threadId })
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero dei messaggi' });
  }
});

// Aggiungi messaggio a un thread
router.post('/:threadId/messages', async (req, res) => {
  const { sender, content } = req.body;

  try {
    const thread = await Thread.findById(req.params.threadId);
    if (!thread.isOpen) {
      return res.status(403).json({ message: 'Thread chiuso' });
    }

    const message = await Message.create({
      threadId: req.params.threadId,
      sender,
      content
    });

    thread.lastActivity = Date.now();
    await thread.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Errore nell\'invio del messaggio' });
  }
});

router.get('/unread-count/:username', async (req, res) => {
  try {
    // Prima troviamo i thread dove l'utente è il destinatario
    const userThreads = await Thread.find({
      $or: [
        { creator: req.params.username },
        // Aggiungiamo questa condizione per i thread creati dall'admin per questo utente specifico
        { isAdminCreated: true, targetUser: req.params.username }
      ]
    }).select('_id');

    const threadIds = userThreads.map(thread => thread._id);

    // Contiamo i messaggi non letti solo nei thread destinati all'utente
    const unreadCount = await Message.countDocuments({
      threadId: { $in: threadIds }, // Solo nei thread dell'utente
      readBy: { $ne: req.params.username },
      sender: { $ne: req.params.username }
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Error fetching unread count' });
  }
});

router.post('/:threadId/messages/read', async (req, res) => {
  const { username } = req.body;
  try {
    await Message.updateMany(
      {
        threadId: req.params.threadId,
        readBy: { $ne: username }
      },
      { $addToSet: { readBy: username } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error marking messages as read' });
  }
});

module.exports = router;