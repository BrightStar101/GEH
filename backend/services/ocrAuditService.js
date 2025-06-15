/**
 * ocrAuditService.js
 *
 * Logs OCR usage events for analytics and internal QA
 */

const OcrAuditLog = require('../models/ocrAuditModel');

/**
 * Records OCR activity for a given user and file
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.fileName
 * @param {string} params.mimeType
 * @param {boolean} params.success
 * @param {string} [params.languageHint='en']
 * @param {number} [params.confidence=null]
 */
async function recordOcrEvent({
  userId,
  fileName,
  mimeType,
  success,
  languageHint = 'en',
  confidence = null,
}) {
  try {
    if (!userId || !fileName || !mimeType) return;

    const entry = new OcrAuditLog({
      userId,
      fileName,
      mimeType,
      success,
      languageHint,
      confidence,
    });

    await entry.save();
  } catch (err) {
    console.error('OcrAuditService: Failed to log OCR event', err.message);
  }
}

module.exports = {
  recordOcrEvent,
};
