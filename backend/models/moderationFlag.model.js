/**
 * moderationFlag.model.js
 *
 * Persistent moderation schema with full audit support, escalation tracking,
 * and soft-delete logic for global compliance (e.g., GDPR, CCPA).
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const ModerationMatchSchema = new Schema({
  tag: { type: String, required: true },
  tier: { type: String, enum: ['low', 'medium', 'high'], required: true },
  confidence: { type: Number, min: 0, max: 1, required: true },
  triggeredBy: [String],
  trace: [String],
}, { _id: false });

const HistoryEntrySchema = new Schema({
  action: {
    type: String,
    enum: ['approved', 'removed', 'escalated', 'reverted', 'deleted'],
    required: true,
  },
  by: { type: String, required: true },
  role: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' },
}, { _id: false });

const ModerationFlagSchema = new Schema({
  originalText: { type: String, required: true },
  langCode: { type: String, required: true },
  source: { type: String, enum: ['userInput', 'aiResponse'], required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  autoEscalated: { type: Boolean, default: false },

  matches: [ModerationMatchSchema],
  highestTier: { type: String, enum: ['low', 'medium', 'high'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'removed', 'escalated'], default: 'pending' },

  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  reviewerNotes: { type: String, default: '' },
  deletedAt: { type: Date, default: null },

  history: [HistoryEntrySchema],
}, {
  timestamps: true,
  versionKey: false,
});

// Indexes
ModerationFlagSchema.index({ status: 1 });
ModerationFlagSchema.index({ createdBy: 1 });
ModerationFlagSchema.index({ 'matches.tag': 1 });
ModerationFlagSchema.index({ reviewedBy: 1 });
ModerationFlagSchema.index({ highestTier: 1 });
ModerationFlagSchema.index({ deletedAt: 1 });

module.exports = mongoose.model('ModerationFlag', ModerationFlagSchema);
