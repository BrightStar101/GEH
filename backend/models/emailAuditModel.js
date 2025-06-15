/**
 * emailAuditModel.js
 *
 * Global Entry Hub (GEH)
 * Batch 34 – Outreach Integration & Email Metadata
 *
 * Purpose:
 * Stores all outbound email metadata for audit, analytics, compliance, and Wave-based targeting.
 */

const mongoose = require('mongoose');

const EmailAuditSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `${props.value} is not a valid email address.`,
      },
    },
    templateId: { type: String, required: true },
    sendgridMessageId: { type: String },
    language: {
      type: String,
      enum: ['en', 'es', 'hi', 'zh'],
      required: true,
      default: 'en',
    },
    wave: { type: Number },
    status: {
      type: String,
      enum: ['sent', 'queued', 'failed', 'bounced', 'unsubscribed', 'blocked'],
      required: true,
      default: 'queued',
    },
    retryCount: { type: Number, default: 0 },
    deliveryLatencyMs: { type: Number, default: null },
    region: { type: String },
    sourceChannel: { type: String },
    funnelStage: {
      type: String,
      enum: ['free_user', 'paid_user', 'ugc_submitter', 'partner', 'unknown'],
      default: 'unknown',
    },
    reason: { type: String },
  },
  {
    timestamps: true,
    collection: 'emailAuditLogs',
  }
);

// Compound indexes
EmailAuditSchema.index({ email: 1, templateId: 1, status: 1 });
EmailAuditSchema.index({ wave: 1, status: 1 });
EmailAuditSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('EmailAuditLog', EmailAuditSchema);
