/**
 * getReviewerLoadScore.js
 *
 * Calculates a reviewer load/performance score between 0 and 100.
 * Weighted by tier mix, average resolution time, and total reviewed flags.
 */

function getReviewerLoadScore({ total = 0, byTier = {}, avgResolutionTimeMs = null }) {
  try {
    if (total === 0 || avgResolutionTimeMs === null) return 0;

    const tierWeights = { low: 1, medium: 2, high: 3 };

    const weightedTierTotal =
      (byTier.low || 0) * tierWeights.low +
      (byTier.medium || 0) * tierWeights.medium +
      (byTier.high || 0) * tierWeights.high;

    const tierScore = Math.min(1, weightedTierTotal / (total * 3));
    const timeScore = avgResolutionTimeMs > 0
      ? Math.max(0, 1 - avgResolutionTimeMs / 3600000)
      : 1;

    const finalScore = Math.round((tierScore * 0.6 + timeScore * 0.4) * 100);

    return finalScore;
  } catch (err) {
    console.error("getReviewerLoadScore failed:", err);
    return 0;
  }
}

module.exports = getReviewerLoadScore;
