const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread', required: true },
  sender: { type: String, required: true },
  content: { type: String, required: true },
  readBy: [{ type: String }],
  timestamp: { type: Date, default: Date.now },
  isAdminMessage: { type: Boolean, default: false }
});

module.exports = mongoose.model('Message', MessageSchema);