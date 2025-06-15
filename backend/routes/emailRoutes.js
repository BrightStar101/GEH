const express = require('express');
const { getEmailLogs, getEmailSummaryStats, getEmailLogsByUser } = require('../controllers/adminEmailController');
const authMiddleware = require('../middleware/authMiddleware');
const adminCheckMiddleware = require('../middleware/adminCheckMiddleware');

const router = express.Router();

router.get('/admin/email-logs', authMiddleware, adminCheckMiddleware, getEmailLogs);
router.get('/admin/email-summary', authMiddleware, adminCheckMiddleware, getEmailSummaryStats);
router.get('/admin/email-logs/by-user/:userId', authMiddleware, adminCheckMiddleware, getEmailLogsByUser);

module.exports = router;
