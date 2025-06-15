// Purpose: Logs and retrieves admin export actions for audit traceability

const mongoose = require("mongoose");

const exportAuditSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  exportType: {
    type: String,
    enum: ["upgrade", "moderation", "usage"],
    required: true,
  },
  filters: {
    type: Object,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ExportAuditLog = mongoose.model("ExportAuditLog", exportAuditSchema);

async function logExport(adminId, exportType, filters = {}) {
  try {
    await ExportAuditLog.create({
      adminId,
      exportType,
      filters,
    });
  } catch (err) {
    console.error("logExport error:", err);
  }
}

async function getRecentLogs() {
  try {
    return await ExportAuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("adminId", "email")
      .lean();
  } catch (err) {
    console.error("getRecentLogs error:", err);
    return [];
  }
}

module.exports = {
  logExport,
  getRecentLogs,
};
