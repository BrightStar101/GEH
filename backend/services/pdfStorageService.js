const StorageMetadata = require('../models/storageMetadataModel');
const dayjs = require('dayjs');

/**
 * validateFileAccess
 * Verifies user access and expiration status for a PDF
 */
async function validateFileAccess(fileId, userId) {
  try {
    const record = await StorageMetadata.findOne({ fileId, userId });
    if (!record) return { allowed: false, reason: "File not found or unauthorized" };
    if (record.isLifetime) return { allowed: true };

    const now = new Date();
    if (now > record.expiresAt) {
      return { allowed: false, reason: "File has expired" };
    }

    return { allowed: true };
  } catch (err) {
    console.error("validateFileAccess error:", err);
    return { allowed: false, reason: "Server error" };
  }
}

/**
 * getRemainingDays
 * Calculates remaining time before file expiration
 */
async function getRemainingDays(fileId, userId) {
  try {
    const record = await StorageMetadata.findOne({ fileId, userId });
    if (!record) return { success: false, message: "File not found" };

    if (record.isLifetime) {
      return { success: true, daysRemaining: null, isLifetime: true };
    }

    const now = dayjs();
    const expiry = dayjs(record.expiresAt);
    const daysRemaining = expiry.diff(now, "day");

    return {
      success: true,
      daysRemaining: daysRemaining >= 0 ? daysRemaining : 0,
      isLifetime: false,
    };
  } catch (err) {
    console.error("getRemainingDays error:", err);
    return { success: false, message: "Server error" };
  }
}

/**
 * shouldOfferLifetimeUpsell
 * Returns true if file is set to expire within 7 days and is not lifetime
 */
async function shouldOfferLifetimeUpsell(fileId, userId) {
  try {
    const record = await StorageMetadata.findOne({ fileId, userId });
    if (!record || record.isLifetime) return false;

    const now = dayjs();
    const expires = dayjs(record.expiresAt);
    const daysLeft = expires.diff(now, 'day');

    return daysLeft >= 0 && daysLeft <= 7;
  } catch (err) {
    console.error("shouldOfferLifetimeUpsell error:", err);
    return false;
  }
}

module.exports = {
  validateFileAccess,
  getRemainingDays,
  shouldOfferLifetimeUpsell,
};
