const mongoose = require('mongoose');

// Definisci lo schema per un pagamento
const paymentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true, // Assicura che lo username non abbia spazi inutili
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: ['BTC', 'USD', 'EUR'], // Aggiungi altre valute se necessario
    required: true,
  },
  method: {
    type: String,
    enum: ['BTC', 'Bank Transfer', 'PayPal'], // Metodi di pagamento supportati
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  adminProcessed: {
    type: Boolean,
    default: false, // Indica se l'admin ha già elaborato il pagamento
  },
});

// Crea il modello Payment
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
