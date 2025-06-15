const express = require('express');
const router = express.Router();

const {
  getWaveSummary,
  getWaveEmailLogs,
} = require('../controllers/waveStatusController');

const {
  retryFailedEmailsInWave,
} = require('../controllers/emailRetryController');

const {
  exportWaveAuditCsv,
} = require('../services/emailAuditDownloadService');

const authMiddleware = require('../middleware/authMiddleware');
const adminCheckMiddleware = require('../middleware/adminCheckMiddleware');

router.get('/admin/waves/summary', authMiddleware, adminCheckMiddleware, getWaveSummary);
router.get('/admin/waves/:waveId/audit', authMiddleware, adminCheckMiddleware, getWaveEmailLogs);
router.get('/admin/waves/:waveId/export', authMiddleware, adminCheckMiddleware, exportWaveAuditCsv);
router.post('/admin/waves/:waveId/retry', authMiddleware, adminCheckMiddleware, retryFailedEmailsInWave);

module.exports = router;
