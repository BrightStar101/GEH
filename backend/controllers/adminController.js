/**
 * adminController.js
 *
 * Global Entry Hub (GEH)
 * Admin Controller for System Intelligence
 *
 * Purpose:
 * Provides administrative access to platform telemetry, including PDF audit logs.
 * Ensures output is secure, sanitized, and query-scalable.
 */

const formModel = require('../models/formModel');
const PromptLog = require('../models/PromptLog');
const userModel = require('../models/userModel');
const { getRecentPDFDownloads } = require('../services/pdfAuditService');
const logger = require('../utils/loggerUtils');

/**
 * GET /api/admin/pdf-audit
 *
 * Returns the latest PDF download audit records to the Admin Panel.
 * Only accessible via `adminOnlyMiddleware`.
 *
 * @param {Object} req - Express request (admin user context)
 * @param {Object} res - Express response
 * @returns {JSON[]} Array of audit log objects
 */
async function getRecentPDFDownloadsHandler(req, res) {
  try {
    const logs = await getRecentPDFDownloads(100); // Limit to 100 for performance

    const sanitizedLogs = logs.map((log) => ({
      timestamp: log.timestamp,
      userId: log.userId,
      formId: log.formId,
      downloadType: log.downloadType || 'user',
      locale: log.locale || 'en',
      geo: {
        city: log.geo?.city || 'unknown',
        region: log.geo?.region || 'unknown',
        country: log.geo?.country || 'unknown',
      },
    }));

    res.status(200).json({ logs: sanitizedLogs });
  } catch (error) {
    logger.logError('AdminController: Failed to retrieve audit logs', error);
    res.status(500).json({ message: 'Internal server error while fetching audit logs.' });
  }
}

/**
 * GET /api/admin/systemStats
 *
 * Returns the system statistics to the Admin Dashboard.
 * Only accessible via `adminOnlyMiddleware`.
 *
 * @param {Object} req - Express request (admin user context)
 * @param {Object} res - Express response
 * @returns {JSON[]} Array of system stats objects
 */
async function getSystemStats(req, res) {
  try {
    const totalUsers = await userModel.countDocuments({}),
      totalForms = await formModel.countDocuments({}),
      totalPrompts = await PromptLog.countDocuments({});

    res.status(200).json({
      totalUsers,
      totalForms,
      totalPrompts
    });
  } catch (error) {
    logger.logError('AdminController: Failed to retrieve system stats', error);
    res.status(500).json({ message: 'Internal server error while fetching system stats.' });
  }
}

module.exports = {
  getRecentPDFDownloads: getRecentPDFDownloadsHandler,
  getSystemStats
};
