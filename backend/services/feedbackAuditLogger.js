/**
 * feedbackAuditLogger.js
 *
 * GEH Feedback Collection Logger
 * Logs and validates structured user feedback for AI sessions or general UX
 */

const mongoose = require('mongoose');
const { logError } = require('../utils/loggerUtils');

const feedbackSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  agent: { type: String, enum: ['mira', 'kairo'], required: true },
  sessionId: { type: String, required: true },
  message: { type: String, maxlength: 1000, required: true },
  score: { type: Number, min: 1, max: 5, required: true },
  submittedAt: { type: Date, default: Date.now },
});

const FeedbackAudit = mongoose.model('FeedbackAudit', feedbackSchema);

/**
 * Validates the payload to prevent malformed entries
 */
function validateFeedbackPayload(entry) {
  return (
    entry &&
    typeof entry.userId === 'string' &&
    ['mira', 'kairo'].includes(entry.agent) &&
    typeof entry.sessionId === 'string' &&
    typeof entry.message === 'string' &&
    entry.message.length > 0 &&
    entry.message.length <= 1000 &&
    typeof entry.score === 'number' &&
    entry.score >= 1 &&
    entry.score <= 5
  );
}

/**
 * Writes a new feedback record to MongoDB
 */
async function logFeedback(entry) {
  try {
    if (!validateFeedbackPayload(entry)) {
      throw new Error('Invalid feedback payload.');
    }

    const doc = new FeedbackAudit(entry);
    return await doc.save();
  } catch (err) {
    logError('Feedback log failed:', err);
    throw err;
  }
}

module.exports = {
  logFeedback,
};
