/**
 * usageLogModel.js
 *
 * Global Entry Hub (GEH)
 * Tracks user Mira session access for time-gated enforcement
 */

const mongoose = require("mongoose");

const usageLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  sessionType: {
    type: String,
    enum: ["chat", "ocr", "form"],
    default: "chat",
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  planTier: {
    type: String,
    enum: ["free", "starter", "official", "family"],
    required: true,
  },
  fallbackUsed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UsageLog = mongoose.model("UsageLog", usageLogSchema);

async function logNewSession({ userId, planTier, sessionType = "chat", fallbackUsed = false }) {
  const entry = new UsageLog({
    userId,
    planTier,
    sessionType,
    fallbackUsed,
  });
  return await entry.save();
}

async function getLastSessionStart(userId) {
  const lastLog = await UsageLog.findOne({ userId })
    .sort({ startedAt: -1 });
  return lastLog?.startedAt || null;
}

async function getSessionLogForUser(userId) {
  return await UsageLog.find({ userId }).sort({ startedAt: -1 }).exec();
}

module.exports = {
  logNewSession,
  getLastSessionStart,
  getSessionLogForUser,
};
