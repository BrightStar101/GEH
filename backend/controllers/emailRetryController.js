/**
 * backend/controllers/emailRetryController.js
 *
 * Global Entry Hub (GEH)
 * Batch 37 – Email Wave Monitoring & Admin Control
 *
 * Purpose:
 * Handles admin-initiated retries of previously failed emails within a given wave.
 * Pulls failed logs from audit table, re-dispatches them via emailDispatchService,
 * and returns a summary report to the requesting admin.
 */

const retryFailedEmails = require('../services/retryFailedEmails');
const { logError } = require('../utils/loggerUtils');

/**
 * Retries all failed email logs associated with a specific wave ID.
 */
async function retryFailedEmailsInWave(req, res) {
  try {
    const { waveId } = req.params;
    const adminUser = req.user?.email || 'system';

    if (!waveId) {
      return res.status(400).json({
        success: false,
        message: 'Missing wave ID',
      });
    }

    const result = await retryFailedEmails(waveId, adminUser);

    return res.status(200).json({
      success: true,
      message: `Retry for wave ${waveId} completed.`,
      result,
    });
  } catch (err) {
    logError('retryFailedEmailsInWave failed:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Wave retry error',
    });
  }
}

module.exports = {
  retryFailedEmailsInWave,
};
