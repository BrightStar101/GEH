/**
 * adminRoutes.js
 *
 * Global Entry Hub (GEH)
 * Admin Intelligence & Export Routes
 */

const express = require('express');
const adminOnlyMiddleware = require('../middleware/adminOnlyMiddleware');
const overrideRoutes = require('./overrideRoutes');
const { getRecentPDFDownloads, getSystemStats } = require('../controllers/adminController');
const { exportPDFDownloadLogs } = require('../controllers/adminExportController');
const { exportOcrLogs } = require('../controllers/adminExportOcrController');

const router = express.Router();

router.get('/systemStats', adminOnlyMiddleware, getSystemStats)
router.get('/pdf-audit', adminOnlyMiddleware, getRecentPDFDownloads);
router.post('/export-pdf-audit', adminOnlyMiddleware, exportPDFDownloadLogs);
router.post('/export-ocr-logs', adminOnlyMiddleware, exportOcrLogs);
router.use('/overrides', adminOnlyMiddleware, overrideRoutes);

module.exports = router;
