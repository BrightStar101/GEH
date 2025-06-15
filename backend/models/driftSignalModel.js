/**
 * driftSignalModel.js
 *
 * Global Entry Hub (GEH)
 * Mongoose Model – Drift Signals
 *
 * Purpose:
 * Stores statistical drift signals triggered by AI confidence shifts
 */

const mongoose = require('mongoose');

const driftSignalSchema = new mongoose.Schema({
  fileId: { type: String, required: true },
  score: { type: Number, required: true, min: 0, max: 1 },
  agentVersion: { type: String, required: true },
  signalType: {
    type: String,
    enum: ['confidence_drop', 'distribution_shift', 'outlier_score'],
    default: 'confidence_drop',
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DriftSignal', driftSignalSchema);
