/**
 * pdfStorageRoutes.js
 *
 * Global Entry Hub (GEH)
 * Handles lifetime storage download, access validation, and expiry checks
 */

const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const {
  checkFileAccess,
  checkExpiryCountdown,
  downloadPdf,
} = require('../controllers/pdfStorageController');

const router = express.Router();

/**
 * GET /api/pdf/check-access/:fileId
 */
router.get('/check-access/:fileId', requireAuth, checkFileAccess);

/**
 * GET /api/pdf/check-expiry/:fileId
 */
router.get('/check-expiry/:fileId', requireAuth, checkExpiryCountdown);

/**
 * GET /api/pdf/download/:fileId
 */
router.get('/download/:fileId', requireAuth, downloadPdf);

module.exports = router;
