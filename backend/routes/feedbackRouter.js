const express = require('express');
const { logFeedback } = require('../services/feedbackAuditLogger');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * POST /api/feedback
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { userId, score, message } = req.body;

    if (!userId || typeof score !== 'number' || score < 1 || score > 5) {
      return res.status(400).json({ success: false, message: 'Invalid input.' });
    }

    await logFeedback({ userId, agent: 'mira', score, message });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('feedbackRouter POST failed:', err);
    return res.status(500).json({ success: false, message: 'Server error while submitting feedback.' });
  }
});

module.exports = router;
