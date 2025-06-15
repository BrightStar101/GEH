/**
 * upgradeLogsService.js
 *
 * Unified upgrade log utility for GEH
 * Used by Stripe/PayPal webhooks, admin upgrades, lifetime feature unlocks
 */

const UpgradeLog = require('../models/upgradeLogsModel');
const { logError } = require('../utils/loggerUtils');

/**
 * Records a new upgrade action to MongoDB
 * @param {Object} params
 * @param {string} params.userId - required
 * @param {string} params.upgradeType - "manual" | "bulk" | "webhook"
 * @param {boolean} params.success
 * @param {Object} [params.metadata] - optional extra info
 * @param {string} [params.fileId] - optional upgraded file ID
 */
async function logUpgrade({ userId, upgradeType, success, metadata = {}, fileId = null }) {
  try {
    if (!userId || !upgradeType) throw new Error('Missing upgrade log parameters');

    const entry = new UpgradeLog({
      userId,
      upgradeType,
      fileId,
      success,
      metadata,
    });

    await entry.save();
  } catch (err) {
    logError('upgradeLogsService: failed to save log', err.message);
  }
}

/**
 * Fetches recent upgrade history for a user
 * @param {string} userId
 * @param {number} [limit=50]
 * @returns {Promise<Array>}
 */
async function getUpgradeHistory(userId, limit = 50) {
  try {
    return await UpgradeLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  } catch (err) {
    logError('upgradeLogsService: failed to fetch logs', err.message);
    return [];
  }
}

module.exports = {
  logUpgrade,
  getUpgradeHistory,
};
