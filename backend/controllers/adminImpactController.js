/**
 * adminImpactController.js
 *
 * Returns anonymized usage metrics for internal admin dashboard.
 */

const { getImpactMetrics } = require('../services/impactMetricService');
const logger = require('../utils/loggerUtils');

/**
 * GET /admin-impact
 * Returns anonymized system usage metrics for display
 */
async function getAdminImpactSummary(req, res) {
  try {
    const metrics = await getImpactMetrics();

    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (err) {
    logger.logError('AdminImpactController: Failed to return impact summary', err);
    res.status(500).json({
      success: false,
      message: 'Unable to load admin impact metrics.',
    });
  }
}

module.exports = {
  getAdminImpactSummary,
};
