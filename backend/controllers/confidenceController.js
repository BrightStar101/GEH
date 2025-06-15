/**
 * confidenceController.js
 *
 * Purpose: Handles admin confidence scoring + drift control logic
 */

const confidenceScoreService = require('../services/confidenceScoreService');
const driftDetectionService = require('../services/driftDetectionService');
const retrainingAgentService = require('../services/retrainingAgentService');

/**
 * GET /api/confidence/:fileId
 */
async function getConfidenceScoreByFile(req, res) {
  try {
    const { fileId } = req.params;
    if (!fileId) return res.status(400).json({ success: false, message: "Missing fileId." });

    const result = await confidenceScoreService.fetchScoreByFileId(fileId);
    if (!result) {
      return res.status(404).json({ success: false, message: "No score found for this file." });
    }

    res.json({ success: true, score: result });
  } catch (err) {
    console.error("getConfidenceScoreByFile error:", err);
    res.status(500).json({ success: false, error: "Unable to fetch confidence score." });
  }
}

/**
 * GET /api/confidence/drift
 */
async function getAllDriftSignals(req, res) {
  try {
    const signals = await driftDetectionService.getRecentDriftSignals();
    res.json({ success: true, signals });
  } catch (err) {
    console.error("getAllDriftSignals error:", err);
    res.status(500).json({ success: false, error: "Unable to fetch drift signals." });
  }
}

/**
 * POST /api/confidence/retrain-toggle
 */
async function toggleRetrainingAgent(req, res) {
  try {
    const { enabled } = req.body;
    const adminId = req.user?.id;

    if (typeof enabled !== "boolean") {
      return res.status(400).json({ success: false, message: "Missing or invalid enabled flag." });
    }

    await retrainingAgentService.setRetrainingStatus(enabled, adminId);
    res.json({ success: true, message: `Retraining agent ${enabled ? "enabled" : "disabled"}.` });
  } catch (err) {
    console.error("toggleRetrainingAgent error:", err);
    res.status(500).json({ success: false, error: "Unable to update retraining state." });
  }
}

/**
 * GET /api/confidence/retrain-status
 */
async function getRetrainingAgentStatus(req, res) {
  try {
    const status = await retrainingAgentService.getRetrainingStatus();
    res.json({ success: true, status });
  } catch (err) {
    console.error("getRetrainingAgentStatus error:", err);
    res.status(500).json({ success: false, error: "Unable to fetch retraining status." });
  }
}

module.exports = {
  getConfidenceScoreByFile,
  getAllDriftSignals,
  toggleRetrainingAgent,
  getRetrainingAgentStatus,
};
