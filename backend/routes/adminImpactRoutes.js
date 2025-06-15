/**
 * adminImpactRoutes.js
 *
 * Secure route exposing anonymized usage metrics to internal admin dashboard.
 * Serves data to /admin-impact dashboard.
 */

const express = require('express');
const requireAdmin = require('../middleware/adminAuthMiddleware');
//const { requireAdmin } = require('../middleware/adminAuthMiddleware');
const { getAdminImpactSummary } = require('../controllers/adminImpactController');

const router = express.Router();

/**
 * @route   GET /api/admin-impact
 * @desc    Return anonymized admin metrics for dashboard display
 * @access  Private (Admin-only)
 */
router.get('/', requireAdmin, getAdminImpactSummary);

module.exports = router;
