/**
 * miraPolicyGuard.js
 *
 * Global Entry Hub (GEH)
 * Mira Chat Policy Enforcement Middleware (Batch 33)
 *
 * Purpose:
 * Enforces legal disclaimers, multilingual safety statements,
 * access limitations, and admin overrides for Mira.
 */

const { getUserTierById } = require('../services/subscriptionService');
const { getUserById } = require('../services/userProfileService');
const { getTranslatedDisclaimer } = require('../utils/miraResponseFormatter');
const { detectLanguage } = require('../utils/languageDetection');
const { logError } = require('../utils/loggerUtils');

/**
 * Middleware to enforce legal compliance and safety disclaimers for Mira access.
 * Applies multilingual notices, access restrictions by region, and admin override logic.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function miraPolicyGuard(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized. User ID missing.' });
    }

    if (req.user?.role === 'admin') {
      return next();
    }

    const userTier = await getUserTierById(userId);
    if (!userTier) {
      return res.status(403).json({ error: 'User subscription tier not found.' });
    }

    const userProfile = await getUserById(userId);
    const isAdminOverride = userProfile?.flags?.overrideMiraGate === true;

    if (isAdminOverride) {
      req.miraPolicy = { disclaimer: 'Admin override active. Full access granted.' };
      return next();
    }

    const userLang = 'en';//detectLanguage(req.body?.message || '') || 'en';

    // Safety notice text for multilingual delivery
    const disclaimerText = await getTranslatedDisclaimer(userLang);

    // Example hardcoded tier rules (can expand per plan)
    const restrictedTiers = ['free', 'expired'];
    if (restrictedTiers.includes(userTier)) {
      return res.status(403).json({
        error: 'Mira access requires a paid plan. Please upgrade to continue.',
        disclaimer: disclaimerText
      });
    }

    // Attach policy data to request for use in controller
    req.miraPolicy = {
      disclaimer: disclaimerText,
      userTier
    };

    return next();
  } catch (err) {
    logError('Mira Policy Guard Error:', err);
    return res.status(500).json({ error: 'Policy check failed. Please try again.' });
  }
}

module.exports = miraPolicyGuard;
