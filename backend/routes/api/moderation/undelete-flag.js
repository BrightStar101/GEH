/**
 * @route POST /api/moderation/undelete-flag
 * @desc Restores a previously soft-deleted moderation flag
 * @access Protected — Requires JWT (role: superadmin or compliance)
 * @body { flagId: string }
 */

const express = require("express");
const { authMiddleware } = require("../../../middleware/authMiddleware");
const { undeleteFlag } = require("../../../services/dbModerationService");
const { logger } = require("../../../utils/loggerUtils");

const router = express.Router();

router.post("/undelete-flag", authMiddleware, async (req, res) => {
  try {
    const { flagId } = req.body;

    if (!flagId) {
      return res.status(400).json({
        success: false,
        message: "Missing required flagId.",
      });
    }

    const user = req.user;
    if (!user || !user.id || !user.role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: reviewer context missing.",
      });
    }

    const restored = await undeleteFlag(flagId, user.id, user.role);

    if (!restored) {
      return res.status(403).json({
        success: false,
        message: "Undelete failed — unauthorized or flag not deleted.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Flag successfully restored.",
      data: restored,
    });
  } catch (err) {
    logger.logError("undeleteFlag route failed:", err);
    return res.status(500).json({
      success: false,
      message: "Internal error while undeleting moderation flag.",
    });
  }
});

module.exports = router;
