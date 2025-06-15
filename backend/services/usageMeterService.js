const Form = require('../models/formModel');
const { logInfo, logError } = require('../utils/loggerUtils');

/**
 * Returns how many forms the user has completed
 */
async function getUserFormCount(userId) {
  try {
    if (!userId) throw new Error("Missing userId");

    const count = await Form.countDocuments({
      userId,
      status: "completed",
      isArchived: false,
    });

    return count;
  } catch (err) {
    logError("❌ Failed to get user form count", err);
    return 0;
  }
}

/**
 * Checks if the user is over their allowed form limit
 */
function checkTierLimit(userTier, userFormCount) {
  const tierLimits = {
    free: 1,
    starter: 2,
    official: 20,
    family: 60,
  };

  const max = tierLimits[userTier] ?? 1;
  const allowed = userFormCount < max;

  return { allowed, max };
}

/**
 * Blocks access if usage is over the cap
 */
async function enforceUsageCap(userTier, userId) {
  try {
    const count = await getUserFormCount(userId);
    const { allowed, max } = checkTierLimit(userTier, count);
    const remaining = Math.max(0, max - count);

    logInfo("📊 Form usage check", {
      userId,
      tier: userTier,
      count,
      allowed,
      remaining,
    });

    return { allowed, remaining, max };
  } catch (err) {
    logError("❌ Failed during usage cap check", err);
    return { allowed: false, remaining: 0, max: 0 };
  }
}

module.exports = {
  getUserFormCount,
  checkTierLimit,
  enforceUsageCap,
};
