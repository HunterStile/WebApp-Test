// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  tcBalance: {
    type: Number,
    default: 0 // Saldo iniziale di TC per ogni nuovo utente
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;