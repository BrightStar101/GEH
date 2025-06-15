/**
 * @route GET /api/moderation/export
 * @desc Exports moderation flags as CSV or JSON (GDPR-compliant)
 * @access Protected (JWT required)
 */

const express = require("express");
const { authMiddleware } = require("../../../middleware/authMiddleware");
const { exportModerationData } = require("../../../services/exportModerationService");
const { logger } = require("../../../utils/loggerUtils");

const router = express.Router();

router.get("/export", authMiddleware, async (req, res) => {
  try {
    const {
      format = "json",
      dsar = "false",
      ...filters
    } = req.query;

    const validFormats = ["csv", "json"];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        message: `Invalid format requested. Allowed: ${validFormats.join(", ")}`,
      });
    }

    const isDsar = dsar === "true";

    const exportData = await exportModerationData({
      filters,
      format,
      isDsar,
    });

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=moderation-export.csv");
      return res.send(exportData);
    }

    return res.status(200).json({
      success: true,
      data: exportData,
    });
  } catch (err) {
    logger.logError("exportFlags.js GET failed:", err);
    return res.status(500).json({ success: false, message: "Failed to generate export." });
  }
});

module.exports = router;
