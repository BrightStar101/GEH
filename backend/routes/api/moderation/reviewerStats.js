/**
 * @route GET /api/moderation/reviewer-stats
 * @desc Returns moderation performance metrics for the current reviewer
 * @access Protected (JWT required)
 */

const express = require("express");
const { authMiddleware } = require("../../../middleware/authMiddleware");
const ModerationFlag = require("../../../models/moderationFlag.model");
const { getReviewerLoadScore } = require("../../../utils/getReviewerLoadScore");
const { logger } = require("../../../utils/loggerUtils");

const router = express.Router();

router.get("/reviewer-stats", authMiddleware, async (req, res) => {
  try {
    const { id: reviewerId, role } = req.user;

    if (!reviewerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: reviewer ID missing.",
      });
    }

    const flags = await ModerationFlag.find({
      reviewedBy: reviewerId,
      deletedAt: null,
    }).lean();

    const total = flags.length;
    const byTier = { low: 0, medium: 0, high: 0 };
    let totalDurationMs = 0;
    let resolvedCount = 0;

    for (const flag of flags) {
      const tier = flag.highestTier || "low";
      if (byTier[tier] !== undefined) byTier[tier]++;

      if (flag.reviewedAt && flag.createdAt) {
        const created = new Date(flag.createdAt).getTime();
        const reviewed = new Date(flag.reviewedAt).getTime();
        totalDurationMs += reviewed - created;
        resolvedCount++;
      }
    }

    const avgResolutionTimeMs = resolvedCount > 0
      ? Math.round(totalDurationMs / resolvedCount)
      : null;

    const loadScore = getReviewerLoadScore({
      total,
      byTier,
      avgResolutionTimeMs,
    });

    return res.status(200).json({
      success: true,
      reviewerId,
      role,
      totalReviewed: total,
      byTier,
      avgResolutionTimeMs,
      loadScore,
    });
  } catch (err) {
    logger.logError("reviewerStats.js GET failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve reviewer stats.",
    });
  }
});

module.exports = router;
