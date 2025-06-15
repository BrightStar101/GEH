/**
 * adminAuditLogService.js
 *
 * Provides access to structured logs for PDF downloads, upgrades, and OCR scans
 * Used by internal dashboards and export reviewers
 */

const PDFDownloadAudit = require('../models/pdfDownloadAuditModel');
const UpgradeLog = require('../models/upgradeLogsModel');
const OcrAudit = require('../models/ocrAuditModel');
const { logError } = require('../utils/loggerUtils');

/**
 * Returns the most recent download requests across all users
 */
async function getRecentPDFDownloads(limit = 100) {
  try {
    return await PDFDownloadAudit.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  } catch (err) {
    logError('AdminAuditLog: Failed to get PDF downloads', err.message);
    return [];
  }
}

/**
 * Returns recent upgrade log entries
 */
async function getRecentUpgrades(limit = 100) {
  try {
    return await UpgradeLog.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  } catch (err) {
    logError('AdminAuditLog: Failed to get upgrade logs', err.message);
    return [];
  }
}

/**
 * Returns recent OCR events
 */
async function getRecentOcrEvents(limit = 100) {
  try {
    return await OcrAudit.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  } catch (err) {
    logError('AdminAuditLog: Failed to get OCR events', err.message);
    return [];
  }
}

module.exports = {
  getRecentPDFDownloads,
  getRecentUpgrades,
  getRecentOcrEvents,
};
