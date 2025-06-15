const ModerationFlag = require('models/moderationFlag.model');
const { getReviewerLoadScore } = require('utils/getReviewerLoadScore');
const { logger } = require('utils/loggerUtils');

/**
 * Generates reviewer analytics based on moderation flag history.
 */
async function getReviewerAnalytics(reviewerIds) {
  try {
    const reviewerArray = Array.isArray(reviewerIds) ? reviewerIds : [reviewerIds];
    const allFlags = await ModerationFlag.find({
      reviewedBy: { $in: reviewerArray },
      deletedAt: null,
    }).lean();

    const reviewerMap = {};

    for (const reviewerId of reviewerArray) {
      const reviewerFlags = allFlags.filter((f) => f.reviewedBy === reviewerId);
      const byTier = { low: 0, medium: 0, high: 0 };
      let totalDuration = 0;
      let resolved = 0;

      for (const flag of reviewerFlags) {
        const tier = flag.highestTier || 'low';
        if (byTier[tier] !== undefined) byTier[tier]++;

        if (flag.reviewedAt && flag.createdAt) {
          const duration = new Date(flag.reviewedAt) - new Date(flag.createdAt);
          if (!isNaN(duration)) {
            totalDuration += duration;
            resolved++;
          }
        }
      }

      const avgResolutionTimeMs = resolved > 0 ? Math.round(totalDuration / resolved) : null;
      const score = getReviewerLoadScore({ total: reviewerFlags.length, byTier, avgResolutionTimeMs });

      reviewerMap[reviewerId] = {
        reviewerId,
        totalReviewed: reviewerFlags.length,
        byTier,
        avgResolutionTimeMs,
        loadScore: score,
      };
    }

    return Object.values(reviewerMap);
  } catch (err) {
    logger.logError('getReviewerAnalytics failed:', err);
    return [];
  }
}

module.exports = {
  getReviewerAnalytics,
};
