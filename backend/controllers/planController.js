/**
 * exportOpsController.js
 *
 * Global Entry Hub (GEH)
 * Admin export logic for upgrade logs, moderation logs, usage summaries
 */

const exportOpsService = require('../services/exportOpsService');
const csvBuilder = require('../utils/csvBuilder');
const exportAuditLogger = require('../utils/exportAuditLogger');

/**
 * GET /api/admin/export/upgrade
 */
async function exportUpgradeLogs(req, res) {
  try {
    const { fromDate, toDate } = req.query;
    const adminId = req.user.id;

    const data = await exportOpsService.getUpgradeLogs({ fromDate, toDate });
    const csv = csvBuilder.toCSV(data, [
      { label: "User ID", key: "userId" },
      { label: "File ID", key: "fileId" },
      { label: "Upgrade Type", key: "upgradeType" },
      { label: "Success", key: "success" },
      { label: "Timestamp", key: "createdAt" },
    ]);

    await exportAuditLogger.logExport(adminId, "upgrade", { fromDate, toDate });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=upgrade-logs.csv");
    return res.send(csv);
  } catch (err) {
    console.error("exportUpgradeLogs error:", err);
    res.status(500).json({ success: false, error: "Failed to export upgrade logs." });
  }
}

/**
 * GET /api/admin/export/moderation
 */
async function exportModerationLogs(req, res) {
  try {
    const { fromDate, toDate } = req.query;
    const adminId = req.user.id;

    const data = await exportOpsService.getModerationLogs({ fromDate, toDate });
    const csv = csvBuilder.toCSV(data, [
      { label: "Submission ID", key: "submissionId" },
      { label: "Reviewed By", key: "reviewedBy" },
      { label: "Decision", key: "status" },
      { label: "Rejection Reason", key: "decisionNote" },
      { label: "Timestamp", key: "createdAt" },
    ]);

    await exportAuditLogger.logExport(adminId, "moderation", { fromDate, toDate });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=moderation-logs.csv");
    return res.send(csv);
  } catch (err) {
    console.error("exportModerationLogs error:", err);
    res.status(500).json({ success: false, error: "Failed to export moderation logs." });
  }
}

/**
 * GET /api/admin/export/usage
 */
async function exportUsageSummary(req, res) {
  try {
    const adminId = req.user.id;
    const data = await exportOpsService.getUsageSummary();

    const csv = csvBuilder.toCSV(data, [
      { label: "Date", key: "date" },
      { label: "Files Created", key: "fileCount" },
      { label: "Upgrades", key: "upgradeCount" },
      { label: "Upgrade Rate (%)", key: "upgradeRate" },
    ]);

    await exportAuditLogger.logExport(adminId, "usage");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=usage-summary.csv");
    return res.send(csv);
  } catch (err) {
    console.error("exportUsageSummary error:", err);
    res.status(500).json({ success: false, error: "Failed to export usage data." });
  }
}

/**
 * GET /api/admin/export/logs
 */
async function getExportAuditLogs(req, res) {
  try {
    const logs = await exportAuditLogger.getRecentLogs();
    res.json({ success: true, logs });
  } catch (err) {
    console.error("getExportAuditLogs error:", err);
    res.status(500).json({ success: false, error: "Failed to load export logs." });
  }
}

module.exports = {
  exportUpgradeLogs,
  exportModerationLogs,
  exportUsageSummary,
  getExportAuditLogs,
};
