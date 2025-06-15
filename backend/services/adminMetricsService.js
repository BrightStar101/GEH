const UpgradeLog = require('models/upgradeLogsModel');
const StorageMetadata = require('models/storageMetadataModel');

async function getSystemMetrics() {
  try {
    const totalUpgrades = await UpgradeLog.countDocuments({ success: true });
    const totalFiles = await StorageMetadata.countDocuments({});
    const upgradeLogs = await UpgradeLog.aggregate([
      { $match: { success: true, upgradeType: "manual" } },
      {
        $group: {
          _id: "$metadata.tier",
          count: { $sum: 1 },
        },
      },
    ]);

    const breakdown = {};
    upgradeLogs.forEach((entry) => {
      breakdown[entry._id || "unknown"] = entry.count;
    });

    const upgradeRate = totalFiles > 0 ? ((totalUpgrades / totalFiles) * 100).toFixed(1) : "0.0";

    return {
      upgradeRatePercent: upgradeRate,
      totalFiles,
      totalUpgrades,
      upgradesByTier: breakdown,
    };
  } catch (err) {
    console.error("getSystemMetrics error:", err);
    throw err;
  }
}

module.exports = { getSystemMetrics };
