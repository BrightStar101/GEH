// utils/noAIMode.js

const logger = require('../services/loggerService');
const { ForbiddenError } = require('./errorUtils');

/**
 * Returns true if the user is currently flagged as NO-AI (free tier or exhausted plan).
 * Used to block GPT access and enforce fallback UX.
 *
 * @param {Object} user - Authenticated user object
 * @returns {Promise<boolean>}
 */
async function isNoAIMode(user) {
  try {
    if (!user || !user._id) throw new Error('Missing user context for AI mode check');
    // const metadata = await getUserPlanMetadata(user._id);

    // Admins always have AI access
    if (user?.role === 'admin') return false;

    // Enforce AI gating based on plan and prompt count
    const plan = user?.planTier;
    const remainingPrompts = 10;//metadata?.remainingPrompts || 0;

    const noAI = !plan || plan === 'free' || remainingPrompts <= 0;

    if (noAI) {
      logger.info({
        action: 'no_ai_mode_enforced',
        userId: user._id,
        tier: plan || 'unknown',
        reason: 'Insufficient plan or prompts',
      });

      // Optional CLA trigger
      logger.triggerCLA({
        event: 'no_ai_access_block',
        userId: user._id,
        tier: plan,
      });
    }

    return noAI;
  } catch (err) {
    logger.error({
      action: 'no_ai_mode_failed',
      userId: user?._id || 'unknown',
      error: err.message,
    });

    // Fallback to safe state: assume NO AI access to prevent abuse
    return true;
  }
}

/**
 * Middleware to block access to AI endpoints if user is in NO-AI mode.
 * Attach to any route requiring GPT access.
 */
function enforceNoAIMode() {
  return async function (req, res, next) {
    try {
      const user = req.user;
      const noAI = await isNoAIMode(user);

      if (noAI) {
        logger.warn({
          action: 'ai_access_denied',
          route: req.originalUrl,
          userId: user._id,
        });

        throw new ForbiddenError('Mira access requires a paid plan or valid prompt count.');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  isNoAIMode,
  enforceNoAIMode,
};
