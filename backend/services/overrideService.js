const { logInfo, logError } = require('utils/loggerUtils');
const User = require('models/userModel');

/**
 * Admin-level override tool to apply or simulate elevated access for a user.
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
