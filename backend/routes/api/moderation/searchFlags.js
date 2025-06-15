/**
 * @route GET /api/moderation/flags
 * @desc Returns paginated moderation flags, excluding soft-deleted by default
 * @access Protected (JWT required)
 * @query ?status=&tag=&tier=&reviewedBy=&createdBy=&includeDeleted=&page=&limit=
 */

const express = require("express");
const ModerationFlag = require("../../../models/moderationFlag.model");
const { authMiddleware } = require("../../../middleware/authMiddleware");
const { logger } = require("../../../utils/loggerUtils");

const router = express.Router();

router.get("/flags", authMiddleware, async (req, res) => {
  try {
    const {
      status,
      tag,
      tier,
      reviewedBy,
      createdBy,
      includeDeleted = "false",
      page = 1,
      limit = 25,
    } = req.query;

    const filters = {};

    if (status) filters.status = status;
    if (tier) filters.highestTier = tier;
    if (reviewedBy) filters.reviewedBy = reviewedBy;
    if (createdBy) filters.createdBy = createdBy;
    if (tag) filters["matches.tag"] = tag;

    // Soft delete filter (exclude unless explicitly included)
    if (includeDeleted !== "true") {
      filters.deletedAt = null;
    }

    const flags = await ModerationFlag.find(filters)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ModerationFlag.countDocuments(filters);

    return res.status(200).json({
      success: true,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      flags,
    });
  } catch (err) {
    logger.logError("searchFlags.js GET failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch moderation flags.",
    });
  }
});

module.exports = router;
