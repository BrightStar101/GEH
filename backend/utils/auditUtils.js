// enhancements/utils/auditUtils.js

/**
 * auditUtils.js
 *
 * Utility functions for retrieving, filtering, and formatting audit logs
 * for the Global Entry Hub admin dashboard.
 *
 * Supports:
 * - Secure retrieval of audit logs by admin
 * - CLA-safe fallback handling
 * - Optional filters by date, user, or category
 */

const AuditLog = require('../models/AuditLog');
const logger = require('../services/loggerService');

/**
 * Retrieves audit logs from the database with optional filters.
 *
 * @param {object} options - Filter options
 * @param {string} [options.userId] - Filter by user
 * @param {string} [options.category] - e.g., 'login', 'adminAction'
 * @param {Date} [options.startDate]
 * @param {Date} [options.endDate]
 * @param {number} [options.limit]
 * @returns {Promise<object[]>} Array of audit log entries
 */
const getAuditLogsFromDB = async (options = {}) => {
  try {
    const query = {};
    const {
      userId,
      category,
      startDate,
      endDate,
      limit = 100,
    } = options;

    if (userId) query.userId = userId;
    if (category) query.category = category;
    if (startDate || endDate) query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return logs;
  } catch (err) {
    logger.error('[auditUtils] Failed to retrieve audit logs:', err.message);
    return []; // Fail-safe return for UI stability
  }
};

module.exports = {
  getAuditLogsFromDB,
};
