/**
 * logLanguageFallback.js
 *
 * @route POST /api/debugger/logLanguageFallback
 * @desc Logs a language fallback event for telemetry and global diagnostics
 * @access Public (anonymous, PII-free) — Rate limited
 */

const express = require('express');
const { logLanguageFallbackEvent } = require('../../../services/debuggerLogService');
const { sanitizeInput } = require('../../../utils/sanitizeInput');
const { logger } = require('../../../utils/loggerUtils');
const { fallbackLimiter } = require('../../../middleware/rateLimiter');

const router = express.Router();

router.post("/", fallbackLimiter, async (req, res) => {
  try {
    const { from, fallbackTo } = req.body;

    const cleanFrom = sanitizeInput(from);
    const cleanFallbackTo = sanitizeInput(fallbackTo);

    if (!cleanFrom || !cleanFallbackTo) {
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }

    await logLanguageFallbackEvent({ from: cleanFrom, fallbackTo: cleanFallbackTo });

    return res.status(200).json({ success: true });
  } catch (err) {
    logger.logError("logLanguageFallback.js POST failed:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
