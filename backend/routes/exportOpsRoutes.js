const express = require('express');
const {
  exportUpgradeLogs,
  exportModerationLogs,
  exportUsageSummary,
  getExportAuditLogs,
} = require('../controllers/exportOpsController');
const { requireAdmin } = require('../middleware/adminAuthMiddleware');

const router = express.Router();

router.get('/export/upgrade', requireAdmin, exportUpgradeLogs);
router.get('/export/moderation', requireAdmin, exportModerationLogs);
router.get('/export/usage', requireAdmin, exportUsageSummary);
router.get('/export/logs', requireAdmin, getExportAuditLogs);

module.exports = router;
