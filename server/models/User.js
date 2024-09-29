const mongoose = require('mongoose');

// Schema per i draghi
const dragonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  miningPower: { type: Number, required: true },
  resistance: { type: Number, required: true },
  bonus: { type: Number, default: 0 },
});

// Schema per le uova in incubazione
const incubatorSchema = new mongoose.Schema({
  eggType: { type: String, required: true },
  incubationEndTime: { type: Date, required: true },  // Tempo di schiusa
});

const eggForSaleSchema = new mongoose.Schema({
  eggType: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }, // Quantità disponibile per la vendita
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tcBalance: { type: Number, default: 0 },
  eggs: { type: Map, of: Number, default: {} },  // Uova possedute dall'utente
  eggsForSale: [eggForSaleSchema],              // Uova messe in vendita
  incubators: [incubatorSchema],                // Incubatori dell'utente
  dragons: [dragonSchema],                      // Draghi posseduti dall'utente
  miningZone: [dragonSchema],                   // Zona mining per i draghi attualmente in uso
  btcAddress: { type: String },
  encryptedPrivateKey: { type: String },
  btcBalance: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', userSchema);
