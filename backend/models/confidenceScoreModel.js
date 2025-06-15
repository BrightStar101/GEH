/**
 * confidenceScoreModel.js
 *
 * Global Entry Hub (GEH)
 * Mongoose Model – Confidence Scores
 *
 * Purpose:
 * Stores AI-generated confidence scores per file with audit metadata
 */

const mongoose = require('mongoose');

const confidenceScoreSchema = new mongoose.Schema({
  fileId: { type: String, required: true, index: true },
  score: { type: Number, required: true, min: 0, max: 1 },
  thresholdBreached: { type: Boolean, default: false },
  agentVersion: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ConfidenceScore', confidenceScoreSchema);
