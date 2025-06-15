const UpgradeLog = require("models/upgradeLogsModel");
const ModerationQueue = require("models/moderationQueueModel");
const UGCSubmission = require("models/ugcSubmissionModel");
const StorageMetadata = require("models/storageMetadataModel");

async function getUpgradeLogs(filters = {}) {
  try {
    const query = {};
    if (filters.fromDate || filters.toDate) {
      query.createdAt = {};
      if (filters.fromDate) query.createdAt.$gte = new Date(filters.fromDate);
      if (filters.toDate) query.createdAt.$lte = new Date(filters.toDate);
    }

    return await UpgradeLog.find(query).lean();
  } catch (err) {
    console.error("getUpgradeLogs error:", err);
    throw new Error("Failed to retrieve upgrade logs.");
  }
}

async function getModerationLogs(filters = {}) {
  try {
    const query = {};
    if (filters.fromDate || filters.toDate) {
      query.createdAt = {};
      if (filters.fromDate) query.createdAt.$gte = new Date(filters.fromDate);
      if (filters.toDate) query.createdAt.$lte = new Date(filters.toDate);
    }

    return await ModerationQueue.find(query)
      .populate("submissionId", "status decisionNote")
      .populate("reviewedBy", "email")
      .lean();
  } catch (err) {
    console.error("getModerationLogs error:", err);
    throw new Error("Failed to retrieve moderation logs.");
  }
}

async function getUsageSummary() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const fileCount = await StorageMetadata.countDocuments({
      createdAt: { $gte: today },
    });

    const upgradeCount = await UpgradeLog.countDocuments({
      success: true,
      createdAt: { $gte: today },
    });

    const upgradeRate = fileCount > 0 ? ((upgradeCount / fileCount) * 100).toFixed(1) : "0.0";

    return [
      {
        date: today.toISOString().split("T")[0],
        fileCount,
        upgradeCount,
        upgradeRate,
      },
    ];
  } catch (err) {
    console.error("getUsageSummary error:", err);
    throw new Error("Failed to compile usage summary.");
  }
}

module.exports = {
  getUpgradeLogs,
  getModerationLogs,
  getUsageSummary,
};
