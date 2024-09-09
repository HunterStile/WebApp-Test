const mongoose = require('mongoose');

// Schema per i draghi
const dragonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  miningCapacity: { type: Number, required: true },  // Capacità di mining
  resistance: { type: Number, default: 100 },        // Resistenza massima iniziale
  lastMiningTime: { type: Date, default: Date.now }, // Tempo dell'ultimo mining
});

// Schema per le uova in incubazione
const incubatorSchema = new mongoose.Schema({
  eggType: { type: String, required: true },
  incubationEndTime: { type: Date, required: true },  // Tempo di schiusa
});

const eggForSaleSchema = new mongoose.Schema({
  eggType: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }, // Add quantity field
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tcBalance: { type: Number, default: 0 },
  eggs: { type: Map, of: Number, default: {} },  // Uova possedute dall'utente
  eggsForSale: [eggForSaleSchema],              // Uova messe in vendita
  incubators: [incubatorSchema],                // Incubatori dell'utente
  dragons: [dragonSchema],                      // Draghi posseduti dall'utente
  btcAddress: { type: String },
  encryptedPrivateKey: { type: String },
  btcBalance: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', userSchema);
