const ModerationFlag = require('models/moderationFlagModel');
const logger = require('utils/loggerUtils');

async function undeleteFlag(flagId, reviewerId, reviewerRole) {
  try {
    const flag = await ModerationFlag.findById(flagId);
    if (!flag || !flag.deletedAt) return null;

    const allowedRoles = ["superadmin", "compliance"];
    if (!allowedRoles.includes(reviewerRole)) {
      return null;
    }

    const now = new Date();
    flag.deletedAt = null;

    flag.history.push({
      action: "undeleted",
      by: reviewerId,
      role: reviewerRole,
      timestamp: now,
      note: "Flag restored after soft-deletion",
    });

    await flag.save();
    return flag;
  } catch (err) {
    logger.logError("undeleteFlag failed:", err);
    return null;
  }
}

module.exports = { undeleteFlag };
