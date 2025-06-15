/**
 * Admin-only route for retrieving user feedback logs
 */

const express = require('express');
const mongoose = require('mongoose');
const { authMiddleware } = require('../middleware/authMiddleware');
const { logError } = require('../utils/loggerUtils');

const router = express.Router();
const FeedbackAudit = mongoose.model('FeedbackAudit');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }

    const logs = await FeedbackAudit.find({}).sort({ submittedAt: -1 }).limit(250).lean();
    return res.status(200).json({ success: true, entries: logs });
  } catch (err) {
    logError('adminFeedbackRouter GET failed:', err);
    return res.status(500).json({ success: false, message: 'Failed to load feedback logs.' });
  }
});

module.exports = router;
