// models/Conversion.js
const mongoose = require('mongoose');

const conversionSchema = new mongoose.Schema({
  conversion_id: { type: String, required: true, unique: true },
  campaign_name: { type: String, required: true },
  site_url: { type: String },
  date: { type: Date, default: Date.now },
  type: { type: String },
  tracking: { type: String },
  aff_var: { type: String },
  netrevenue: { type: Number },
  commission: { type: String },
  payment: { type: String },
  status: { type: String },
  campaign_status: { type: String }
});

module.exports = mongoose.model('Conversion', conversionSchema);