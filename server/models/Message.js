const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true }, // Utente o "admin"
  receiver: { type: String, required: true }, // Utente o "admin"
  subject: { type: String }, // Titolo opzionale
  content: { type: String, required: true }, // Contenuto del messaggio
  isRead: { type: Boolean, default: false }, // Se il messaggio è stato letto
  timestamp: { type: Date, default: Date.now } // Data di creazione
});

module.exports = mongoose.model('Message', MessageSchema);
