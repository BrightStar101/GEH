const UpgradeLog = require('models/upgradeLogsModel');

async function getFailedUpgrades() {
  try {
    const failed = await UpgradeLog.find({ success: false })
      .sort({ createdAt: -1 })
      .limit(50);
    return failed;
  } catch (err) {
    console.error("getFailedUpgrades error:", err);
    throw err;
  }
}

module.exports = {
  getFailedUpgrades,
};
