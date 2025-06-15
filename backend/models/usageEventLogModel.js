/**
 * usageEventLogModel.js
 *
 * Global Entry Hub (GEH)
 * Tracks monetized feature usage: PDFs, forms, AI, upgrades, logins
 */

const mongoose = require("mongoose");

const usageEventLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  event: {
    type: String,
    required: true,
    enum: [
      "form_created",
      "pdf_download",
      "ai_interaction",
      "tier_upgrade",
      "login_success",
    ],
    index: true,
  },
  metadata: {
    type: Object,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

usageEventLogSchema.index({ userId: 1, event: 1, timestamp: -1 });

const UsageEventLog = mongoose.model("UsageEventLog", usageEventLogSchema);

async function logUsageEvent({ userId, event, metadata = {} }) {
  if (!userId || !event) {
    throw new Error("Missing required fields for usage event logging.");
  }

  const entry = new UsageEventLog({ userId, event, metadata });
  return await entry.save();
}

async function getUserEventHistory(userId, event = null, limit = 50) {
  const query = { userId };
  if (event) query.event = event;

  return await UsageEventLog.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .exec();
}

module.exports = {
  logUsageEvent,
  getUserEventHistory,
};
