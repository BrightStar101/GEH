/**
 * miraAuditAgent.js
 *
 * Global Entry Hub (GEH)
 * Mira Chat Audit Agent (Batch 33)
 *
 * Purpose:
 * Records each user interaction with Mira including AI confidence, plan tier,
 * fallback usage, timestamps, and audit tags. Enables downstream analysis and
 * QA to improve accuracy and reliability of Mira’s interactions.
 */

const mongoose = require('mongoose');
const { logError } = require('../utils/loggerUtils');

const miraAuditSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  input: {
    type: String,
    required: true
  },
  output: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  fallbackUsed: {
    type: Boolean,
    default: false
  },
  tier: {
    type: String,
    enum: ['free', 'starter', 'official', 'family'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sessionType: {
    type: String,
    enum: ['chat', 'ocr', 'form'],
    default: 'chat'
  },
  detectedIntent: {
    type: String,
    default: null
  },
  flags: {
    discrepancy: {
      type: Boolean,
      default: false
    }
  }
});

const MiraAudit = mongoose.model('MiraAudit', miraAuditSchema);

/**
 * Logs a full audit record of Mira's chat interaction.
 * @param {Object} data - Metadata for audit log
 * @param {string} data.userId - User ID
 * @param {string} data.input - Original user message
 * @param {string} data.output - Mira’s generated response
 * @param {number} data.confidence - Confidence score (0–1)
 * @param {boolean} data.fallbackUsed - Whether fallback language was used
 * @param {string} data.tier - User subscription tier
 * @param {Date} [data.timestamp] - Timestamp override (default = now)
 * @param {string} [data.sessionType] - Type of session (default = 'chat')
 * @param {string} [data.detectedIntent] - Optional intent classifier label
 * @returns {Promise<Object>} - Saved document
 */
async function logChatAudit({
  userId,
  input,
  output,
  confidence,
  fallbackUsed,
  tier,
  timestamp = new Date(),
  sessionType = 'chat',
  detectedIntent = null
}) {
  try {
    const discrepancyFlag = confidence < 0.6 && fallbackUsed && tier !== 'free';

    const audit = new MiraAudit({
      userId,
      input,
      output,
      confidence,
      fallbackUsed,
      tier,
      timestamp,
      sessionType,
      detectedIntent,
      flags: {
        discrepancy: discrepancyFlag
      }
    });

    return await audit.save();
  } catch (err) {
    logError('Failed to save Mira chat audit log:', err);
    throw err;
  }
}

/**
 * Logs a basic chat attempt without full metadata (for start events).
 * @param {Object} data
 * @param {string} data.userId - ID of the user
 * @param {string} data.input - Initial message
 * @param {Date} data.timestamp - Attempt time
 * @param {string} [data.type] - Optional type label
 * @returns {Promise<Object>} - Saved lightweight log
 */
async function logChatAttempt({ userId, input, timestamp, tier = 'free', type = 'chat_start' }) {
  try {
    const audit = new MiraAudit({
      userId,
      input,
      output: '[attempt]',
      confidence: 0,
      fallbackUsed: false,
      tier: tier,
      timestamp,
      sessionType: 'chat',
      detectedIntent: type,
      flags: {
        discrepancy: false
      }
    });

    return await audit.save();
  } catch (err) {
    logError('Failed to log Mira attempt:', err);
    throw err;
  }
}

module.exports = {
  logChatAudit,
  logChatAttempt,
};
