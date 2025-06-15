/**
 * adminExportController.js
 *
 * Global Entry Hub (GEH)
 * Admin Export Controller
 *
 * Purpose:
 * Handles secure export of PDF audit logs in CSV or JSON format.
 * Applies server-side filtering, triggers export tracking, and returns download-safe file.
 */

const PDFDownloadAudit = require('../models/pdfDownloadAuditModel');
const { recordExportEvent } = require('../services/exportAuditService');
const { Parser } = require('json2csv');
const logger = require('../utils/loggerUtils');

/**
 * POST /api/admin/export-pdf-audit
 */
async function exportPDFDownloadLogs(req, res) {
  try {
    const { format = 'csv', filters = {}, reason = 'unspecified' } = req.body;

    if (!['csv', 'json'].includes(format)) {
      return res.status(400).json({ message: 'Invalid export format' });
    }

    const MAX_ROWS = 5000;
    const query = buildFilterQuery(filters);
    const logs = await PDFDownloadAudit.find(query).limit(MAX_ROWS).lean();

    await recordExportEvent({
      userId: req.user.id,
      format,
      filtersUsed: filters,
      ip: req.ip,
      reason,
    });

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="pdf_audit_export.json"`);
      return res.status(200).send(JSON.stringify(logs, null, 2));
    } else {
      const parser = new Parser();
      const csv = parser.parse(logs);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="pdf_audit_export.csv"`);
      return res.status(200).send(csv);
    }
  } catch (err) {
    logger.logError('AdminExportController: Failed to export logs', err);
    return res.status(500).json({ message: 'Internal server error during export.' });
  }
}

/**
 * Builds a secure MongoDB filter
 */
function buildFilterQuery(filters) {
  const allowed = ['userId', 'formId', 'downloadType', 'locale', 'geo.country'];
  const mongoQuery = {};

  for (const key of allowed) {
    const val = filters[key];
    if (!val) continue;

    if (key === 'geo.country') {
      mongoQuery['geo.country'] = { $regex: new RegExp(val, 'i') };
    } else {
      mongoQuery[key] = val;
    }
  }

  return mongoQuery;
}

module.exports = {
  exportPDFDownloadLogs,
};
