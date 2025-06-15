/**
 * usageLoggerUtils.js
 *
 * Global Entry Hub (GEH)
 * Utility module for logging user-level feature and form usage events.
 *
 * Purpose:
 * - Provides reusable logging methods for user actions
 * - Tracks AI interactions, form submissions, download requests, etc.
 * - Supports tier enforcement audits and future analytics
 */

const UsageLog = require('../models/usageLogModel');
const logger = require('../utils/loggerUtils');

/**
 * Logs a form creation event for audit and tier tracking
 * @param {String} userId - ID of the user creating the form
 * @param {String} formId - MongoDB ID of the created form
 * @param {String} tierId - Tier at time of creation (e.g. "free", "starter")
 * @returns {Promise<void>}
 */
async function logFormUsage(userId, formId, tierId) {
  try {
    if (!userId || !formId || !tierId) {
      throw new Error('Missing parameters for usage logging.');
    }

    const logEntry = new UsageLog({
      userId,
      event: 'form_created',
      metadata: {
        formId,
        tierId,
      },
    });

    await logEntry.save();
  } catch (err) {
    logger.logError('UsageLogger: logFormUsage failed', err);
  }
}

/**
 * Logs a PDF download request
 * @param {String} userId
 * @param {String} pdfType - e.g., "immigration_summary", "form_i589"
 */
async function logPDFDownload(userId, pdfType) {
  try {
    if (!userId || !pdfType) return;

    const logEntry = new UsageLog({
      userId,
      event: 'pdf_downloaded',
      metadata: { pdfType },
    });

    await logEntry.save();
  } catch (err) {
    logger.logError('UsageLogger: logPDFDownload failed', err);
  }
}

/**
 * Tracks when Mira or Kairo is accessed by a user
 * @param {String} userId
 * @param {String} agent - "mira" or "kairo"
 * @param {String} mode - "chat", "onboarding", "quickcoach"
 */
async function logAIAccess(userId, agent, mode) {
  try {
    const logEntry = new UsageLog({
      userId,
      event: 'ai_agent_used',
      metadata: { agent, mode },
    });

    await logEntry.save();
  } catch (err) {
    logger.logError('UsageLogger: logAIAccess failed', err);
  }
}

module.exports = {
  logFormUsage,
  logPDFDownload,
  logAIAccess,
};
