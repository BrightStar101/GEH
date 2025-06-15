/**
 * upgradeLogsModel.js
 *
 * Global Entry Hub (GEH)
 * Tracks all one-time PDF upgrade events (manual, webhook, or bulk)
 */

const mongoose = require("mongoose");

const upgradeLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  fileId: { type: String }, // Optional for bulk upgrades
  upgradeType: {
    type: String,
    enum: ["manual", "bulk", "webhook"],
    required: true,
  },
  success: { type: Boolean, required: true },
  metadata: { type: Object }, // Any Stripe data or internal context
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UpgradeLog", upgradeLogSchema);
