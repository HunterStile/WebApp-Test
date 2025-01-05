// UserSchema.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  country: { type: String, required: true },
  language: { 
    type: String, 
    required: true,
    enum: ['it', 'de', 'en', 'es']
  },
  acceptedTerms: { type: Boolean, required: true },
  newsletterSubscription: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);