/**
 * adminToolsRoutes.js
 *
 * Global Entry Hub (GEH)
 * Admin Internal Tooling Routes
 */

const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminAccessGuard = require('../middleware/adminAccessGuard');
const { logError } = require('../utils/loggerUtils');

const {
  getAdminDashboard,
} = require('../controllers/adminSystemMetricsController');
const { overrideUserPlan } = require('../controllers/adminPlanController');
const { overrideSubscriptionStatus } = require('../controllers/adminSubscriptionController');
const { getAuditLog } = require('../services/adminAuditService');
const {
  exportStripeLog,
  exportPaypalLog,
} = require('../controllers/adminLegacyLogExportController');

const router = express.Router();

router.use(authMiddleware, adminAccessGuard);

router.get('/dashboard', getAdminDashboard);
router.post('/override/subscription', overrideSubscriptionStatus);
router.post('/override/plan', overrideUserPlan);

router.get('/audit', async (req, res) => {
  try {
    const result = await getAuditLog(req.query);
    return res.status(200).json(result);
  } catch (err) {
    logError('Audit Viewer Error:', err.message);
    return res.status(500).json({ message: 'Audit retrieval failed.' });
  }
});

router.post('/export-stripe-log', exportStripeLog);
router.post('/export-paypal-log', exportPaypalLog);

module.exports = router;
