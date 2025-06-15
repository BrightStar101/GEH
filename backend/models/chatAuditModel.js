const mongoose = require('mongoose');

const chatAuditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String, required: true },
  message: { type: String, required: true },
  isFlagged: { type: Boolean, default: false },
  sentimentScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatAudit', chatAuditSchema);
