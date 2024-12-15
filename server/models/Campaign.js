const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  realUrl: { type: String, required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Campaign', campaignSchema);
