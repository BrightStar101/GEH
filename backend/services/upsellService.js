const StorageMetadata = require("models/storageMetadataModel");
const UpgradeLog = require("models/upgradeLogsModel");

/**
 * Marks a single file as lifetime and logs the attempt
 */
async function markAsLifetime(fileId, userId, upgradeType = "manual") {
  try {
    const updated = await StorageMetadata.findOneAndUpdate(
      { fileId, userId },
      { isLifetime: true },
      { new: true }
    );

    const success = !!updated;

    await UpgradeLog.create({
      userId,
      fileId,
      upgradeType,
      success,
      metadata: { triggeredBy: upgradeType },
    });

    return success
      ? { success: true }
      : { success: false, message: "File not found or already upgraded" };
  } catch (err) {
    console.error("markAsLifetime error:", err);
    return { success: false, error: "Server error" };
  }
}

/**
 * Upgrades all eligible files for a user and logs the result
 */
async function markAllAsLifetime(userId) {
  try {
    const result = await StorageMetadata.updateMany(
      { userId, isLifetime: false },
      { isLifetime: true }
    );

    const success = result.modifiedCount > 0;

    await UpgradeLog.create({
      userId,
      upgradeType: "bulk",
      success,
      metadata: { modifiedCount: result.modifiedCount },
    });

    return {
      success,
      upgradedCount: result.modifiedCount,
    };
  } catch (err) {
    console.error("markAllAsLifetime error:", err);
    return { success: false, error: "Server error" };
  }
}

/**
 * Used by Stripe webhook to log successful upgrades
 */
async function logWebhookUpgrade(userId, fileId, payload = {}) {
  try {
    await StorageMetadata.updateOne(
      { userId, fileId },
      { isLifetime: true }
    );

    await UpgradeLog.create({
      userId,
      fileId,
      upgradeType: "webhook",
      success: true,
      metadata: payload,
    });

    return { success: true };
  } catch (err) {
    console.error("logWebhookUpgrade error:", err);
    return { success: false, error: "Server error" };
  }
}

module.exports = {
  markAsLifetime,
  markAllAsLifetime,
  logWebhookUpgrade,
};
