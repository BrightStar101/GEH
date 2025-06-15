/**
 * adminIntelligenceController.js
 * Purpose: Handles AI agent control, metrics, and audit visibility for admin users
 */

const agentService = require('../services/adminAgentControlService');
const metricsService = require('../services/adminMetricsService');
const auditService = require('../services/adminAuditLogService');

/**
 * GET /api/admin/agents/toggles
 */
async function getAgentToggleList(req, res) {
  try {
    const toggles = await agentService.getAllToggles();
    res.json({ success: true, toggles });
  } catch (err) {
    console.error("getAgentToggleList error:", err);
    res.status(500).json({ success: false, error: "Unable to load toggles." });
  }
}

/**
 * POST /api/admin/agents/toggles/:toggleId
 */
async function updateAgentToggleStatus(req, res) {
  try {
    const { toggleId } = req.params;
    const { enabled } = req.body;
    const adminId = req.user.id;

    if (typeof enabled !== "boolean") {
      return res.status(400).json({ success: false, message: "Invalid toggle state." });
    }

    const result = await agentService.updateToggle(toggleId, enabled, adminId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json({ success: true, message: `Toggle '${toggleId}' updated.` });
  } catch (err) {
    console.error("updateAgentToggleStatus error:", err);
    res.status(500).json({ success: false, error: "Toggle update failed." });
  }
}

/**
 * GET /api/admin/metrics/system-health
 */
async function getSystemHealthMetrics(req, res) {
  try {
    const metrics = await metricsService.getSystemMetrics();
    res.json({ success: true, metrics });
  } catch (err) {
    console.error("getSystemHealthMetrics error:", err);
    res.status(500).json({ success: false, error: "Unable to fetch metrics." });
  }
}

/**
 * GET /api/admin/audit/upgrade-failures
 */
async function getFailedUpgradeLogs(req, res) {
  try {
    const failedLogs = await auditService.getFailedUpgrades();
    res.json({ success: true, logs: failedLogs });
  } catch (err) {
    console.error("getFailedUpgradeLogs error:", err);
    res.status(500).json({ success: false, error: "Unable to load upgrade logs." });
  }
}

module.exports = {
  getAgentToggleList,
  updateAgentToggleStatus,
  getSystemHealthMetrics,
  getFailedUpgradeLogs,
};
