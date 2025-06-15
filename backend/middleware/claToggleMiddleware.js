/**
 * claToggleMiddleware.js
 *
 * Global Entry Hub (GEH)
 * CLA Toggle Middleware
 *
 * Purpose:
 * Middleware that enables or disables CLA-related agent behavior (e.g., retraining, flag logging)
 * based on centralized toggle flags. Used to isolate CLA components if instability or abuse is detected.
 */

const { logWarn, logError } = require('../utils/loggerUtils');
const { getFeatureFlags } = require('../services/adminToggleService');

/**
 * CLA Toggle Middleware
 *
 * Injects `req.disableCLA = true` if CLA is turned off via feature flag.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
async function claToggleMiddleware(req, res, next) {
  try {
    const flags = await getFeatureFlags();

    if (!flags || typeof flags.enableCLA !== 'boolean') {
      logWarn('CLA toggle check returned undefined. Defaulting to DISABLED.');
      req.disableCLA = true;
    } else {
      req.disableCLA = !flags.enableCLA;
    }

    return next();
  } catch (err) {
    logError('CLA toggle middleware failed. Defaulting to DISABLED.', err);
    req.disableCLA = true;
    return next();
  }
}

module.exports = claToggleMiddleware;
