const moderationConfig = require('../config/moderationConfig');
const { flagContent } = require('../utils/flagContent');
const { logWarn, logInfo, logError } = require('../utils/loggerUtils');

// Simulated moderation DB (to be replaced by real DB in Batch 16)
const moderationDB = {
  flags: [],
  rateCounts: new Map(), // Map<userId_or_IP, { count: number, lastReset: ISODate }>
};

/**
 * createModerationFlag
 *
 * Flags content for review if violations are detected.
 * Enforces rate limits from moderationConfig.
 */
function createModerationFlag({ content, langCode, source, createdBy }) {
  try {
    if (isRateLimited(createdBy, source)) {
      logWarn(`[MODERATION] Rate limit exceeded for: ${createdBy}`);
      return null;
    }

    const result = flagContent({ text: content, langCode });
    if (!result.flagged) return null;

    const now = new Date().toISOString();
    const id = `flag_${Date.now()}`;

    const flag = {
      id,
      createdAt: now,
      createdBy,
      langCode,
      originalText: content,
      source,
      matches: result.matches,
      status: "pending",
      highestTier: getHighestTier(result.matches),
      autoEscalated: shouldAutoEscalate(result.matches),
      history: [],
    };

    moderationDB.flags.push(flag);
    incrementRateCount(createdBy, source);
    logInfo(`[MODERATION] Flag created: ${id} (${flag.highestTier})`);

    return flag;
  } catch (err) {
    logError("createModerationFlag failed:", err);
    return null;
  }
}
/**
 * updateFlagStatus
 *
 * Updates moderation status of a flag. Stores audit trail.
 */
function updateFlagStatus(flagId, newStatus, reviewerRole, reviewerId) {
  try {
    const flag = moderationDB.flags.find((f) => f.id === flagId);
    if (!flag) return null;

    const allowedRoles = moderationConfig.tierRoleLimits[flag.highestTier] || [];
    if (!allowedRoles.includes(reviewerRole)) {
      throw new Error("Reviewer role not permitted for this flag tier.");
    }

    const now = new Date().toISOString();
    flag.status = newStatus;
    flag.reviewedAt = now;
    flag.reviewedBy = reviewerId;

    flag.history.push({
      action: newStatus,
      by: reviewerId,
      role: reviewerRole,
      timestamp: now,
    });

    logInfo(`[MODERATION] Flag ${flagId} → ${newStatus} by ${reviewerId}`);
    return flag;
  } catch (err) {
    logError("updateFlagStatus failed:", err);
    return null;
  }
}

/**
 * getFlagsByStatus
 *
 * Returns flags with matching status (e.g., "pending").
 */
function getFlagsByStatus(status = "pending") {
  return moderationDB.flags.filter((f) => f.status === status);
}
function getHighestTier(matches) {
  const tierRank = { low: 1, medium: 2, high: 3 };
  return matches.reduce((prev, curr) =>
    tierRank[curr.tier] > tierRank[prev] ? curr.tier : prev, "low"
  );
}

function shouldAutoEscalate(matches) {
  return matches.some((m) =>
    moderationConfig.tiers[m.tier]?.autoEscalate === true
  );
}

function isRateLimited(actor, source) {
  const limits = moderationConfig.rateLimits;
  const today = new Date().toISOString().slice(0, 10);
  const key = `${actor}-${today}`;
  const current = moderationDB.rateCounts.get(key) || { count: 0 };

  const max = source === "aiResponse"
    ? limits.aiResponse
    : limits.userInput;

  if (current.count >= max) return true;

  current.count += 1;
  moderationDB.rateCounts.set(key, current);
  return false;
}

function incrementRateCount(actor, source) {
  isRateLimited(actor, source); // Increments internally
}

module.exports = {
  createModerationFlag,
  updateFlagStatus,
  getFlagsByStatus,
};
