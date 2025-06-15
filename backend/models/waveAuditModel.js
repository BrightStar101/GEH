/**
 * waveAuditModel.js
 *
 * Batch 36 – Email Wave Trigger System
 * Tracks each triggered outreach wave with execution metadata.
 */

const mongoose = require('mongoose');

const WaveAuditSchema = new mongoose.Schema(
  {
    waveNumber: { type: Number, required: true },
    templateGroup: { type: String, required: true },
    triggeredBy: { type: String, required: true },
    contactCount: { type: Number, required: true },
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, default: null },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'waveAuditLogs',
  }
);

// Indexes
WaveAuditSchema.index({ waveNumber: 1 });
WaveAuditSchema.index({ status: 1 });

module.exports = mongoose.model('WaveAuditLog', WaveAuditSchema);
