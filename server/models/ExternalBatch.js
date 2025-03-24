const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const externalBatchSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  acceptanceDate: {
    type: Date,
    required: true
  },
  batchNumber: {
    type: String,
    required: true,
    trim: true
  },
  ddtDate: {
    type: Date,
    required: true
  },
  ddtNumber: {
    type: String,
    required: true,
    trim: true
  },
  origin: {
    type: String,
    required: true,
    trim: true
  },
  foodDetails: {
    foodName: {
      type: String,
      required: true,
      trim: true
    },
    unitOfMeasure: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true
    },
    expirationDate: {
      type: Date,
      required: true
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indice composto per garantire l'unicità del numero di lotto per ciascun utente
externalBatchSchema.index({ userId: 1, batchNumber: 1 }, { unique: true });

// Update the timestamp before saving
externalBatchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ExternalBatch', externalBatchSchema); 