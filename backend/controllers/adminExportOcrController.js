/**
 * adminExportOcrController.js
 *
 * Global Entry Hub (GEH)
 * Admin OCR Export Controller (Upgraded with row count preview)
 *
 * Purpose:
 * Allows export of filtered OCR audit logs in CSV or JSON format.
 * Returns pre-export count and logs export event for traceability.
 */

const OcrAuditLog = require('../models/ocrAuditModel');
const { recordExportEvent } = require('../services/exportAuditService');
const { Parser } = require('json2csv');
const logger = require('../utils/loggerUtils');

/**
 * POST /api/admin/export-ocr-logs
 */
async function exportOcrLogs(req, res) {
  try {
    const { format = 'csv', filters = {}, reason = 'unspecified', previewOnly = false } = req.body;

    if (!['csv', 'json'].includes(format)) {
      return res.status(400).json({ message: 'Invalid export format' });
    }

    const MAX_ROWS = 5000;
    const query = buildOcrQuery(filters);
    const count = await OcrAuditLog.countDocuments(query);

    if (previewOnly) {
      return res.status(200).json({ recordCount: count });
    }

    const logs = await OcrAuditLog.find(query).limit(MAX_ROWS).lean();

    await recordExportEvent({
      userId: req.user.id,
      format,
      filtersUsed: filters,
      ip: req.ip,
      reason,
    });

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=ocr_export.json');
      return res.status(200).send(JSON.stringify(logs, null, 2));
    } else {
      const parser = new Parser();
      const csv = parser.parse(logs);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=ocr_export.csv');
      return res.status(200).send(csv);
    }
  } catch (err) {
    logger.logError('AdminExportOCRController: Export failed', err);
    res.status(500).json({ message: 'Internal server error during export' });
  }
}

/**
 * Builds a safe MongoDB query from incoming filters.
 */
function buildOcrQuery(filters) {
  const allowed = ['userId', 'mimeType', 'languageHint', 'success'];
  const query = {};

  for (const key of allowed) {
    const value = filters[key];
    if (!value) continue;

    if (key === 'success') {
      query[key] = value === 'true';
    } else {
      query[key] = { $regex: new RegExp(value, 'i') };
    }
  }

  return query;
}

module.exports = {
  exportOcrLogs,
};
