const mongoose = require('mongoose');

const ThreadSchema = new mongoose.Schema({
  creator: { type: String, required: true }, // Utente che ha creato il thread
  subject: { type: String, required: true }, // Titolo del thread
  isOpen: { type: Boolean, default: true }, // Stato del thread
  lastActivity: { type: Date, default: Date.now }, // Ultima attività
  createdAt: { type: Date, default: Date.now },
  targetUser: { type: String },
  isAdminCreated: { type: Boolean, default: false }
});

module.exports = mongoose.model('Thread', ThreadSchema);