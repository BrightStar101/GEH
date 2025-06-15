/**
 * @route POST /api/moderation/moderate-action
 * @desc Updates the moderation status of a flagged item
 * @access Restricted to authorized reviewers
 */

const express = require("express");
const { updateFlagStatus } = require("../../../services/moderationService");
const { logger } = require("../../../utils/loggerUtils");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { flagId, newStatus, reviewerRole, reviewerId } = req.body;

    if (!flagId || !newStatus || !reviewerRole || !reviewerId) {
      return res.status(400).json({
        success: false,
        message: "Missing required moderation fields.",
      });
    }

    const allowedStatuses = ["approved", "removed", "escalated"];
    if (!allowedStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value.",
      });
    }

    const result = updateFlagStatus(flagId, newStatus, reviewerRole, reviewerId);

    if (!result) {
      return res.status(403).json({
        success: false,
        message: "Review action failed or reviewer unauthorized.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Flag ${flagId} updated successfully.`,
      data: result,
    });
  } catch (err) {
    logger.logError("moderateAction.js POST failed:", err);
    return res.status(500).json({ success: false, message: "Internal server error while moderating content." });
  }
});

module.exports = router;
