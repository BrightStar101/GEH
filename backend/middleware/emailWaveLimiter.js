/**
 * emailWaveLimiter.js
 *
 * Global Entry Hub (GEH)
 * Batch 36 – Email Wave Trigger System
 *
 * Purpose:
 * Prevents admin-triggered wave flooding by enforcing a cooldown period per admin
 * and a global lockout for active wave processing. Used to avoid double-execution
 * or system overload during mass sends.
 */

const { logWarn, logError } = require('../utils/loggerUtils');

// In-memory cooldown and lock store (can be swapped for Redis in scale-up)
const cooldownMap = new Map(); // key: admin email, value: timestamp
let globalWaveInProgress = false;

// Cooldown configuration (ms)
const ADMIN_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Middleware to prevent multiple waves being triggered in close succession.
 * Enforces per-admin and global limits.
 * @param {Object} req - Express request object (requires req.user.email)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function emailWaveLimiter(req, res, next) {
  try {
    const adminEmail = req.user?.email || 'unknown-admin';
    const now = Date.now();

    if (globalWaveInProgress) {
      logWarn(`Wave trigger blocked: active wave already in progress`);
      return res.status(429).json({
        success: false,
        message: 'A wave is already in progress. Please wait before sending another.',
      });
    }

    const lastSendTime = cooldownMap.get(adminEmail);
    if (lastSendTime && now - lastSendTime < ADMIN_COOLDOWN_MS) {
      const waitTime = Math.ceil((ADMIN_COOLDOWN_MS - (now - lastSendTime)) / 1000);
      logWarn(`Admin ${adminEmail} blocked for wave rate limit (${waitTime}s remaining)`);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitTime} more seconds before triggering another wave.`,
      });
    }

    // Passed checks — set wave as active
    globalWaveInProgress = true;
    cooldownMap.set(adminEmail, now);

    // Clear lock after 90 seconds (can be improved with lifecycle tracking)
    setTimeout(() => {
      globalWaveInProgress = false;
    }, 90000);

    return next();
  } catch (err) {
    logError('emailWaveLimiter failed:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Wave limiter internal error',
    });
  }
}

module.exports = emailWaveLimiter;
