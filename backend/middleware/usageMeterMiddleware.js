/**
 * usageMeterMiddleware.js
 *
 * Global Entry Hub (GEH)
 * Mira Usage Gate Middleware (Batch 33)
 *
 * Purpose:
 * Validates that the user’s Mira session window is still active.
 * Enforces plan-based access durations (24h, 72h, 7d) with optional grace period.
 */

const { getLastSessionStart } = require('../models/usageLogModel');
const { getUserTierById } = require('../services/subscriptionService');
// const { getLastSessionStart } = require('../services/usageLogService');

const { logError } = require('../utils/loggerUtils');

const PLAN_DURATION_MAP = {
  'free': 0,
  'starter': 24 * 60 * 60 * 1000,     // 24h in ms
  'official': 72 * 60 * 60 * 1000,    // 72h in ms
  'family': 7 * 24 * 60 * 60 * 1000  // 7d in ms
};

const GRACE_PERIOD_MS = 3 * 60 * 1000; // 3-minute grace window

/**
 * Middleware to enforce Mira access time limits based on purchase tier.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware handler
 */
async function usageMeterMiddleware(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    }

    const tier = await getUserTierById(userId);
    const durationAllowed = PLAN_DURATION_MAP[tier];

    if (durationAllowed === undefined) {
      return res.status(403).json({ error: 'Unsupported or expired plan. Please upgrade.' });
    }

    const lastStart = await getLastSessionStart(userId);
    if (!lastStart) {
      return res.status(403).json({ error: 'No usage session found. Please start a plan.' });
    }

    const now = Date.now();
    const sessionAge = now - new Date(lastStart).getTime();

    if (sessionAge <= durationAllowed) {
      return next(); // Still valid
    }

    if (sessionAge <= durationAllowed + GRACE_PERIOD_MS) {
      req.miraGraceWarning = true;
      return next(); // Allow with warning
    }

    return res.status(403).json({
      error: 'Mira access window has expired for your current plan.',
      expiredAt: new Date(lastStart + durationAllowed).toISOString(),
    });
  } catch (err) {
    logError('Error in usageMeterMiddleware:', err);
    return res.status(500).json({ error: 'Session validation failed. Please try again.' });
  }
}

module.exports = usageMeterMiddleware;
