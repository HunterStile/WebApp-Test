const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  realUrl: { type: String, required: true },
  description: { type: String, required: true },
  conditions: { type: String, required: true },
  commissionPlan: { type: String, required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Campaign', campaignSchema);
