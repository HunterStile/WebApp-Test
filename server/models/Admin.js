const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  secretKey: { type: String, required: true } 
});

module.exports = mongoose.model('Admin', adminSchema);
