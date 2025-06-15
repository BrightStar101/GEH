/**
 * confidenceRoutes.js
 *
 * Admin-only API routes for AI confidence scoring analysis and audit
 */

const express = require('express');
const { requireAdmin } = require('../middleware/adminAuthMiddleware');
const { getConfidenceHeatmap, getLowConfidenceRecords } = require('../controllers/confidenceController');

const router = express.Router();

router.get('/heatmap', requireAdmin, getConfidenceHeatmap);
router.get('/low-confidence', requireAdmin, getLowConfidenceRecords);

module.exports = router;
