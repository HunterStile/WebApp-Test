// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tcBalance: { type: Number, default: 0 },
  eggs: { type: Map, of: Number, default: {} },  // Aggiungi questa riga per memorizzare le uova
  btcAddress: { type: String },
  btcBalance: { type: Number, default: 0 }, // Saldo in BTC
});

module.exports = mongoose.model('User', userSchema);