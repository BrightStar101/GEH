/**
 * ocrController.js
 *
 * Global Entry Hub (GEH)
 * OCR Controller (Upgraded)
 *
 * Purpose:
 * Accepts file uploads (PDF or image), triggers Google Vision OCR,
 * returns clean JSON with extracted text, confidence scores, and optional metadata.
 * Logs all OCR attempts to database via `ocrAuditService`.
 */

const { extractTextFromFile } = require('../services/ocrService');
const { recordOcrEvent } = require('../services/ocrAuditService');
const logger = require('../utils/loggerUtils');

/**
 * POST /api/ocr/upload
 *
 * @param {Object} req - Express request (contains JWT user context and uploaded file)
 * @param {Object} res - Express response
 */
async function ocrController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { originalname, mimetype, buffer } = req.file;
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (!allowedTypes.includes(mimetype)) {
      return res.status(415).json({ message: 'Unsupported file type for OCR' });
    }

    const languageHint = req.body.lang || 'en';

    const result = await extractTextFromFile({
      fileBuffer: buffer,
      fileName: originalname,
      mimeType: mimetype,
      userId: req.user?.id,
      languageHint,
    });

    // Log failed OCR attempt
    if (!result || !result.text) {
      await recordOcrEvent({
        userId: req.user?.id,
        fileName: originalname,
        mimeType,
        success: false,
        languageHint,
      });
      return res.status(422).json({ message: 'Unable to extract text from file' });
    }

    // Log successful attempt
    await recordOcrEvent({
      userId: req.user?.id,
      fileName: originalname,
      mimeType,
      success: true,
      confidence: result.confidence || null,
      languageHint,
    });

    res.status(200).json({
      status: 'success',
      extractedText: result.text,
      confidence: result.confidence || null,
      meta: result.meta || {},
    });
  } catch (err) {
    logger.logError('OCR Controller: Processing error', err);
    res.status(500).json({ message: 'Internal error during OCR processing' });
  }
}

module.exports = {
  ocrController,
};
