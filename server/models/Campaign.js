const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  realUrl: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Sport', 'Casino','Sport/Casino','Crypto','Financial Broker'], 
    default: 'Sport' 
  },
  country: { type: String, required: true },
  description: { type: String, required: true },
  conditions: { type: String, required: true },
  commissionPlan: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['attivo', 'disattivo'], 
    default: 'attivo' 
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Campaign', campaignSchema);
