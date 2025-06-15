/**
 * loggerAuditModel.js
 *
 * Schema for storing internal audit logs and admin-tracked actions
 */

const mongoose = require('mongoose');

const loggerAuditSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  actionType: { type: String, required: true }, // e.g., 'delete', 'admin_override', 'plan_change'
  performedBy: { type: String, required: true }, // admin ID
  context: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('LoggerAudit', loggerAuditSchema);
