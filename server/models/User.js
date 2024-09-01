// server/models/User.js
const mongoose = require('mongoose');

const eggForSaleSchema = new mongoose.Schema({
  eggType: { type: String, required: true },
  price: { type: Number, required: true },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tcBalance: { type: Number, default: 0 },
  eggs: { type: Map, of: Number, default: {} },
  eggsForSale: [eggForSaleSchema],  // Nuovo campo per le uova in vendita
  btcAddress: { type: String },
  encryptedPrivateKey: { type: String },
  btcBalance: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', userSchema);
