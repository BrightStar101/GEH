/**
 * backend/controllers/adminEmailController.js
 *
 * Global Entry Hub (GEH)
 * Batch 34 – Outreach Integration & Email Metadata
 *
 * Purpose:
 * Provides admin-facing endpoints for viewing and analyzing outbound email logs.
 * Supports query-based filtering and summary dashboards.
 */

const emailAuditService = require('../services/emailAuditService');
const { logError } = require('../utils/loggerUtils');

/**
 * GET /api/admin/email-logs
 */
async function getEmailLogs(req, res) {
  try {
    const {
      status,
      email,
      templateId,
      wave,
      startDate,
      endDate,
    } = req.query;

    const filterOpts = {
      status,
      email,
      templateId,
      wave: wave ? parseInt(wave) : undefined,
      startDate,
      endDate,
    };

    const logs = await emailAuditService.getEmailLogs(filterOpts);
    return res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    logError('adminEmailController.getEmailLogs failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve email logs.' });
  }
}

/**
 * GET /api/admin/email-summary
 */
async function getEmailSummaryStats(req, res) {
  try {
    const { startDate, endDate, wave } = req.query;

    const filterOpts = {
      wave: wave ? parseInt(wave) : undefined,
      startDate,
      endDate,
    };

    const stats = await emailAuditService.getSummaryStats(filterOpts);
    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    logError('adminEmailController.getEmailSummaryStats failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to generate summary stats.' });
  }
}

/**
 * GET /api/admin/email-logs/by-user/:userId
 */
async function getEmailLogsByUser(req, res) {
  try {
    const userId = req.params.userId;
    if (!userId || userId.length < 8) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }

    const logs = await emailAuditService.getEmailLogs({ userId });
    return res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    logError('adminEmailController.getEmailLogsByUser failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve user logs.' });
  }
}

module.exports = {
  getEmailLogs,
  getEmailSummaryStats,
  getEmailLogsByUser,
};
