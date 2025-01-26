// models/Newsletter.js
const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  language: { 
    type: String, 
    enum: ['it', 'de', 'en', 'es'],
    required: true 
  },
  scheduledAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['draft', 'scheduled', 'sent'], 
    default: 'draft' 
  },
  recipients: {
    type: {
      total: Number,
      successful: Number,
      failed: Number
    },
    default: { total: 0, successful: 0, failed: 0 }
  },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Newsletter', newsletterSchema);