/**
 * tierAccessMiddleware.js
 *
 * Global Entry Hub (GEH)
 * Route middleware that enforces tier-based access for protected endpoints.
 *
 * Used on: AI interactions, form creation, PDF usage, etc.
 */

const User = require('../models/userModel');
const { mapTierToFeatures } = require('../utils/purchaseUtils');
const logger = require('../utils/loggerUtils');

/**
 * Middleware that checks if user has active access to AI features or other protected features.
 * Will reject if access is expired or tier is unsupported.
 *
 * @param {string} requiredFeature - Feature flag required (e.g., "includesAI", "includesPdf")
 * @returns {function} Express middleware function
 */
function enforceTierFeature(requiredFeature) {
  return async function (req, res, next) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: Missing user ID.' });
      }

      if(req.user?.role === 'admin') {
        return next();
      }

      const user = await User.findById(userId);
      if (!user || !user.planTier) {
        return res.status(403).json({ message: 'Access denied: No tier assigned.' });
      }

      const tierMeta = mapTierToFeatures(user.planTier);
      if (!tierMeta) {
        return res.status(403).json({ message: 'Access denied: Unrecognized tier.' });
      }

      const isExpired = user.tierExpiresAt && new Date(user.tierExpiresAt) < new Date();

      if (isExpired) {
        return res.status(403).json({
          message: `Your access has expired. Please renew your plan to use this feature.`,
        });
      }

      if (!tierMeta[requiredFeature]) {
        return res.status(403).json({
          message: `This feature is not included in your current plan.`,
        });
      }

      // Passes all checks — user is allowed
      return next();
    } catch (err) {
      logger.logError('TierAccessMiddleware error', err);
      return res
        .status(500)
        .json({ message: 'Internal error verifying access tier.' });
    }
  };
}

module.exports = { enforceTierFeature };
