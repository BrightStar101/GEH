/**
 * purchaseUtils.js
 *
 * Global Entry Hub (GEH)
 * Utility functions for purchase-related operations and tier access control.
 *
 * Responsibilities:
 * - Audit trail logging
 * - Tier duration and expiry calculations
 * - Access validation helpers
 */

const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const tierConfig = require('../config/purchaseTierConfig.json');

const AUDIT_LOG_PATH = path.join(__dirname, '..', 'logs', 'purchaseAudit.log');

/**
 * Writes a structured purchase audit event to file.
 * @param {String} userId
 * @param {String} action
 * @param {Object} metadata
 */
async function logAuditEvent(userId, action, metadata = {}) {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId,
      action,
      metadata,
    };

    const logString = JSON.stringify(logEntry) + '\n';
    fs.appendFile(AUDIT_LOG_PATH, logString, (err) => {
      if (err) console.error('[Audit Log] Failed to write log:', err.message);
    });
  } catch (err) {
    console.error('[Audit Log] Logging failure:', err.message);
  }
}

/**
 * Safely retrieves tier metadata from config
 * @param {String} tierId
 * @returns {Object|null}
 */
function getTierMeta(tierId) {
  if (!tierId || typeof tierId !== 'string') return null;
  return tierConfig[tierId] || null;
}

/**
 * Determines future expiration timestamp based on duration
 * @param {Number} durationHours
 * @returns {String}
 */
function calculateExpiryTime(durationHours) {
  if (!durationHours || typeof durationHours !== 'number') {
    throw new Error('Invalid duration input for expiry calculation.');
  }
  return dayjs().add(durationHours, 'hour').toISOString();
}

/**
 * Checks if a tier access window is still valid
 * @param {String} expiryTimestamp
 * @returns {Boolean}
 */
function isAccessActive(expiryTimestamp) {
  if (!expiryTimestamp) return false;
  return dayjs().isBefore(dayjs(expiryTimestamp));
}

/**
 * Returns allowed features per tier for UI/meta display
 * @param {String} tierId
 * @returns {Object|null}
 */
function mapTierToFeatures(tierId) {
  const tier = getTierMeta(tierId);
  if (!tier) return null;

  return {
    aiAccessHours: tier.durationHours,
    maxForms: tier.maxForms,
    maxPrompts: tier.maxPrompts,
    includesPdf: tier.includesPdf,
    includesMira: tier.includesAI,
    tierLabel: tier.label,
  };
}

module.exports = {
  logAuditEvent,
  getTierMeta,
  calculateExpiryTime,
  isAccessActive,
  mapTierToFeatures,
};
