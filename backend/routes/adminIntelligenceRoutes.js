/**
 * Admin-only routes for controlling AI agents and viewing system metrics
 */

const express = require('express');
const { requireAdmin } = require('../middleware/adminAuthMiddleware');
const {
  getAgentToggleList,
  updateAgentToggleStatus,
  getSystemHealthMetrics,
  getFailedUpgradeLogs,
} = require('../controllers/adminIntelligenceController');

const router = express.Router();

router.get('/agents/toggles', requireAdmin, getAgentToggleList);
router.post('/agents/toggles/:toggleId', requireAdmin, updateAgentToggleStatus);
router.get('/metrics/system-health', requireAdmin, getSystemHealthMetrics);
router.get('/audit/upgrade-failures', requireAdmin, getFailedUpgradeLogs);

module.exports = router;
