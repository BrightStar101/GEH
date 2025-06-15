/**
 * exportAuditService.js
 *
 * Logs export/download metadata for analytics and auditing
 */

const ExportAuditLog = require('../models/exportAuditModel');
const { anonymizeIP } = require('../utils/ipUtils');

/**
 * Records an export/download event
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.format - csv, json, etc.
 * @param {Object} [params.filtersUsed={}]
 * @param {string} params.ip
 * @param {string} [params.reason="unspecified"]
 */
async function recordExportEvent({
  userId,
  format = 'csv',
  filtersUsed = {},
  ip,
  reason = 'unspecified',
}) {
  try {
    if (!userId) return;

    const audit = new ExportAuditLog({
      userId,
      format,
      filtersUsed,
      ip: anonymizeIP(ip),
      reason,
    });

    await audit.save();
  } catch (err) {
    console.error('ExportAuditService: Failed to log export event:', err.message);
  }
}

module.exports = {
  recordExportEvent,
};
