/**
 * @route POST /api/moderation/undo-flag
 * @desc Reverts the last moderation action on a flag and resets it to "pending"
 * @access Protected (JWT required, role gated via config)
 * @body { flagId: string }
 */

const express = require("express");
const { authMiddleware } = require("../../../middleware/authMiddleware");
const { undoLastAction } = require("../../../services/dbModerationService");
const { logger } = require("../../../utils/loggerUtils");

const router = express.Router();

router.post("/undo-flag", authMiddleware, async (req, res) => {
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
        message: "Unauthorized: missing reviewer context.",
      });
    }

    const result = await undoLastAction(flagId, user.id, user.role);

    if (!result) {
      return res.status(403).json({
        success: false,
        message: "Undo failed — reviewer may not have permission or flag does not exist.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Flag reverted to pending.",
      data: result,
    });
  } catch (err) {
    logger.logError("undoFlagAction.js POST failed:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while undoing flag action.",
    });
  }
});

module.exports = router;
