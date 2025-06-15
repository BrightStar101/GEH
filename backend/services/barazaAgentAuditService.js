/**
 * barazaAuditService.js
 *
 * Stores structured logs from Baraza agents (Mira, Kairo, Lumo, etc.)
 * for trust auditing, fallbacks, and retraining pipelines
 */

const mongoose = require('mongoose');
const { logError } = require('../utils/loggerUtils');

const barazaAuditSchema = new mongoose.Schema({
  agent: { type: String, enum: ['mira', 'kairo', 'lumo'], required: true },
  userId: { type: String, required: true },
  prompt: { type: String, maxlength: 1000 },
  response: { type: String, maxlength: 5000 },
  language: { type: String, default: 'en' },
  confidence: { type: Number, min: 0, max: 1 },
  fallbackUsed: { type: Boolean, default: false },
  retrainCandidate: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  tags: [String],
  notes: { type: String, maxlength: 1000 },
});

const BarazaAuditLog = mongoose.model('BarazaAuditLog', barazaAuditSchema);

/**
 * Writes a new audit entry
 * @param {Object} entry - Full audit log object
 * @returns {Promise<void>}
 */
async function logBarazaEvent(entry) {
  try {
    const log = new BarazaAuditLog(entry);
    await log.save();
  } catch (err) {
    logError('BarazaAuditService: Failed to save audit entry', err.message);
  }
}

module.exports = {
  logBarazaEvent,
};
