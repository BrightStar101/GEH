/**
 * exportAuditModel.js
 *
 * Global Entry Hub (GEH)
 * Admin Export Event Log Schema
 *
 * Purpose:
 * Logs metadata when admins export audit records.
 */

const mongoose = require('mongoose');

const exportAuditSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
      expires: 60 * 60 * 24 * 180, // TTL: 180 days
    },
    format: {
      type: String,
      enum: ['csv', 'json'],
      default: 'csv',
    },
    filtersUsed: {
      type: Object,
      default: {},
    },
    reason: {
      type: String,
      default: 'unspecified',
      maxlength: 200,
    },
    ip: {
      type: String,
      default: 'unknown',
    },
  },
  {
    collection: 'admin_export_audit',
    versionKey: false,
  }
);

module.exports = mongoose.model('ExportAuditLog', exportAuditSchema);
