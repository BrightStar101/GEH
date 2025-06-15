/**
 * @route GET /api/moderation/summary
 * @desc Returns global moderation metrics (volume, escalation rate, tag/tier breakdown)
 * @access Protected (JWT required)
 */

const express = require("express");
const ModerationFlag = require("../../../models/moderationFlag.model");
const { authMiddleware } = require("../../../middleware/authMiddleware");
const { logger } = require("../../../utils/loggerUtils");

const router = express.Router();

router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const flags = await ModerationFlag.find({ deletedAt: null }).lean();

    const totals = {
      total: flags.length,
      byTag: {},
      byTier: { low: 0, medium: 0, high: 0 },
      autoEscalated: 0,
    };

    for (const flag of flags) {
      const tier = flag.highestTier || "low";
      if (totals.byTier[tier] !== undefined) totals.byTier[tier]++;

      if (Array.isArray(flag.matches)) {
        for (const match of flag.matches) {
          const tag = match.tag;
          if (!totals.byTag[tag]) totals.byTag[tag] = 0;
          totals.byTag[tag]++;
        }
      }

      if (flag.autoEscalated) {
        totals.autoEscalated++;
      }
    }

    const escalationRate = flags.length > 0
      ? Math.round((totals.autoEscalated / flags.length) * 100)
      : 0;

    return res.status(200).json({
      success: true,
      summary: {
        totalFlags: totals.total,
        byTag: totals.byTag,
        byTier: totals.byTier,
        autoEscalated: totals.autoEscalated,
        escalationRatePercent: escalationRate,
      },
    });
  } catch (err) {
    logger.logError("moderationSummary.js GET failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve moderation summary.",
    });
  }
});

module.exports = router;
