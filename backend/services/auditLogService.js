// enhancements/services/auditLogService.js

/**
 * auditLogService.js
 *
 * Provides system-wide audit insights for admin dashboards.
 * Used for generating live metrics: downloads, usage types, CLA triggers, etc.
 */

const AuditLog = require('../models/AuditLog');
const logger = require('./loggerService');

/**
 * Fetches summarized audit system stats across categories.
 *
 * @returns {Promise<object>} A map of usage totals by category
 */
const fetchSystemStats = async () => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const result = await AuditLog.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const formatted = result.reduce((acc, entry) => {
      acc[entry._id] = entry.count;
      return acc;
    }, {});

    return {
      timestamp: now.toISOString(),
      totalCategories: Object.keys(formatted).length,
      categoryBreakdown: formatted,
    };
  } catch (err) {
    logger.error('[fetchSystemStats] Failed to aggregate audit data:', err.message);
    return {
      timestamp: new Date().toISOString(),
      totalCategories: 0,
      categoryBreakdown: {},
    };
  }
};

module.exports = {
  fetchSystemStats,
};
