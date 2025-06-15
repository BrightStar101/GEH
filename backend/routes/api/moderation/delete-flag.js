/**
 * @route POST /api/moderation/delete-flag
 * @desc Soft-deletes a moderation flag (GDPR/CCPA compliant)
 * @access Protected (JWT required)
 */

const express = require("express");
const { authMiddleware } = require("../../../middleware/authMiddleware");
const { softDeleteFlag } = require("../../../services/dbModerationService");
const { logger } = require("../../../utils/loggerUtils");

const router = express.Router();

router.post("/delete-flag", authMiddleware, async (req, res) => {
  try {
    const { flagId } = req.body;

    if (!flagId) {
      return res.status(400).json({ success: false, message: "Missing required flagId." });
    }

    const user = req.user;
    if (!user?.id || !user?.role) {
      return res.status(401).json({ success: false, message: "Unauthorized: reviewer context missing." });
    }

    const deleted = await softDeleteFlag(flagId, user.id, user.role);

    if (!deleted) {
      return res.status(403).json({ success: false, message: "Deletion failed — reviewer unauthorized or flag does not exist." });
    }

    return res.status(200).json({
      success: true,
      message: "Flag marked as deleted (soft-delete successful).",
      data: deleted,
    });
  } catch (err) {
    logger.logError("deleteFlag.js POST failed:", err);
    return res.status(500).json({ success: false, message: "Internal error while deleting moderation flag." });
  }
});

module.exports = router;
