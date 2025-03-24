const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QualityControlSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  controlDate: {
    type: Date,
    required: true
  },
  protocolNumber: {
    type: String,
    required: true
  },
  externalBatch: {
    type: Schema.Types.ObjectId,
    ref: 'ExternalBatch',
    required: true
  },
  checkedQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  nonConformingQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  dimensions: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Metodo per garantire che un utente non possa avere due controlli con lo stesso numero di protocollo
QualityControlSchema.index({ userId: 1, protocolNumber: 1 }, { unique: true });

module.exports = mongoose.model('QualityControl', QualityControlSchema); 