/**
 * moderationQueueModel.js
 *
 * Tracks UGC stories under moderation review with reviewer metadata
 */

const mongoose = require('mongoose');

const moderationQueueSchema = new mongoose.Schema({
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UGCSubmission',
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  flagged: {
    type: Boolean,
    default: false,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  decisionNote: {
    type: String,
    default: null,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ModerationQueue', moderationQueueSchema);
