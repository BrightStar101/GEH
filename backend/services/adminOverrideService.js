/**
 * adminOverrideService.js
 *
 * Admin override tool for GEH platform
 * Applies elevated access or plan tier changes by admin staff
 */

const User = require('../models/userModel');
const { logInfo, logError } = require('../utils/loggerUtils');

/**
 * Applies a manual override to a user's profile (planTier, role, etc.)
 * @param {string} userId
 * @param {Object} override
 * @returns {Promise<Object|null>}
 */
async function applyUserOverride(userId, override = {}) {
  try {
    if (!userId || typeof override !== "object") {
      throw new Error("Invalid override request");
    }

    const updated = await User.findByIdAndUpdate(userId, override, {
      new: true,
      runValidators: true,
    }).select("email planTier role isActive");

    if (!updated) {
      throw new Error(`User not found for override: ${userId}`);
    }

    logInfo("✅ Override applied", { userId, override });
    return updated;
  } catch (err) {
    logError("❌ Failed to apply override", err);
    return null;
  }
}

/**
 * Logs a simulated override request for audit only (no DB change)
 * @param {string} userId
 * @param {string} reason
 */
function simulateOverride(userId, reason) {
  try {
    if (!userId || !reason) throw new Error("Missing override simulation parameters");
    logInfo("🔄 Simulated override", { userId, reason, timestamp: new Date().toISOString() });
  } catch (err) {
    logError("❌ Failed to simulate override", err);
  }
}

module.exports = {
  applyUserOverride,
  simulateOverride,
};
