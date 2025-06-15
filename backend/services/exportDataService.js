/**
 * exportDataService.js
 *
 * GDPR/CCPA-compliant data export module for GEH
 * Includes reviews, forms, and OCR scans for a given user
 */

const fs = require('fs');
const path = require('path');
const Review = require('../models/reviewModel');
const Form = require('../models/formModel');
const OcrAudit = require('../models/ocrAuditModel');
const { sanitizeExportPayload } = require('../utils/exportSanitizer');

/**
 * Logs export request metadata to local disk for auditing
 */
function logExportRequest({ userId, userAgent, ip }) {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] Export requested by user ${userId} | IP: ${ip} | UA: ${userAgent}\n`;
    const logPath = path.join(__dirname, '../../logs/export-downloads.log');
    fs.appendFileSync(logPath, logEntry);
  } catch (err) {
    console.error('ExportDataService: Failed to log export download', err.message);
  }
}

/**
 * Compiles and returns all stored user data in structured format
 */
async function exportUserData({ userId, userAgent = 'unknown', ip = 'unknown' }) {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid or missing userId for export.');
    }

    const userReviews = await Review.find({ userId }).lean();
    const userForms = await Form.find({ userId }).lean();
    const ocrScans = await OcrAudit.find({ userId }).lean();

    const rawExport = {
      meta: {
        generatedAt: new Date().toISOString(),
        userId,
      },
      reviews: userReviews,
      forms: userForms,
      ocrScans,
    };

    const sanitized = sanitizeExportPayload(rawExport);
    logExportRequest({ userId, userAgent, ip });

    return sanitized;
  } catch (err) {
    console.error('ExportDataService: Failed to compile export', err.message);
    throw new Error('Unable to compile user export at this time.');
  }
}

module.exports = {
  exportUserData,
};
