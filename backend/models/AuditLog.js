// enhancements/models/AuditLog.js

/**
 * AuditLog.js
 *
 * GEH CLA-Compliant Audit Log Model
 * Captures actions for: fallback flags, tier changes, PDF deletions,
 * override activity, AI retraining triggers, system metrics.
 */

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    category: {
      type: String,
      enum: [
        'cla',
        'tier',
        'pdf',
        'review',
        'system',
        'agent',
        'admin',
        'override',
        'training',
        'purchase',
      ],
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
    flagged: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ['system', 'user', 'admin', 'agent'],
      default: 'system',
    },
    status: {
      type: String,
      enum: ['success', 'warning', 'error'],
      default: 'success'
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
    collection: 'audit_logs',
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
