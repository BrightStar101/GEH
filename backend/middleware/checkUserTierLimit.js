// enhancements/middleware/checkUserTierLimit.js

/**
 * checkUserTierLimit.js
 *
 * Middleware to enforce token and prompt caps for user tiers ($0/$5/$25/$75)
 * with multilingual fallback, compliance triggers, and confidence-safe limits.
 */

const { getUserTierConfig } = require('../config/tierConfig');
const { getUserPromptUsage } = require('../utils/userUsageTracker');
const { logComplianceTrigger } = require('../services/loggerService');
const { getLocalizedText } = require('../utils/languageUtils');

/**
 * Enforces token + prompt usage thresholds for user's current subscription tier.
 * Returns fallback-safe messaging if user exceeds allowed usage.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const checkUserTierLimit = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id || !req.user.planTier) {
      return res.status(401).json({ error: 'Unauthorized request.' });
    }

    const tierKey = req.user.planTier;
    const tierConfig = getUserTierConfig(tierKey);

    if (!tierConfig) {
      return res.status(400).json({ error: 'Tier configuration not found.' });
    }

    const usage = await getUserPromptUsage(req.user._id);
    const locale = req.user.language || 'en';
    const remaining = {
      tokens: tierConfig.tokenLimit - usage.tokensUsed,
      prompts: tierConfig.promptLimit - usage.promptsUsed,
    };

    const overLimit =
      remaining.tokens < 0 || remaining.prompts < 0 || usage.promptsUsed >= tierConfig.promptLimit;

    if (overLimit) {
      // Trigger CLA-safe fallback
      logComplianceTrigger({
        userId: req.user._id,
        type: 'TierLimitExceeded',
        details: { usage, tierKey },
      });

      const responseText = getLocalizedText(locale, 'tierLimit.exceeded') || 'You have reached your usage limit.';

      return res.status(429).json({
        error: responseText,
        cta: getLocalizedText(locale, 'tierLimit.cta') || 'Upgrade your plan to continue using this feature.',
        confidence: 0.0,
        claFlagged: true,
      });
    }

    return next();
  } catch (err) {
    console.error('[checkUserTierLimit Error]', err);
    return res.status(500).json({ error: 'Error checking usage limits.' });
  }
};

module.exports = checkUserTierLimit;
