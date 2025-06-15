/**
 * ocrRoutes.js
 *
 * Global Entry Hub (GEH)
 * OCR Upload and Extraction Routes
 *
 * Purpose:
 * Allows authenticated users to upload scanned images or PDFs,
 * triggering OCR processing via Google Vision API.
 * Protected by JWT, tier access logic, rate limiting, and file validation.
 */

const express = require('express');
const { ocrUploadMiddleware } = require('../middleware/ocrUploadMiddleware');
const { ocrController } = require('../controllers/ocrController');
const { authenticate } = require('../middleware/authMiddleware');
const { ocrRateLimiter } = require('../middleware/ocrRateLimiter');
const { enforceTierFeature } = require('../middleware/tierAccessMiddleware');

const router = express.Router();

/**
 * @route POST /api/ocr/upload
 * @desc Accepts image or PDF for OCR processing
 * @access Private (JWT + OCR access + rate limit)
 * @formData file=<File>
 */
router.post(
  '/upload',
  authenticate,
  ocrRateLimiter,
  enforceTierFeature('includesOcr'),
  ocrUploadMiddleware,
  ocrController
);

module.exports = router;
