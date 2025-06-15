// enhancements/models/PDF.js

/**
 * PDF.js
 *
 * GEH PDF Storage Schema
 * Tracks uploaded PDFs with support for expiry, override, CLA flags, and access audits.
 * Used by: pdfExpiryEnforcer, adminPdfOverrideController, download agents.
 */

const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    formType: {
      type: String,
      required: true,
      enum: ['visa', 'asylum', 'student', 'family', 'employment', 'other'],
    },
    filename: {
      type: String,
      required: true,
      unique: true,
    },
    language: {
      type: String,
      default: 'en',
    },
    originalFilename: {
      type: String,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 86400000), // 90 days
      index: true,
    },
    flaggedForAudit: {
      type: Boolean,
      default: false,
    },
    auditReason: {
      type: String,
      default: '',
      maxlength: 500,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: false,
    versionKey: false,
    collection: 'pdfs',
  }
);

module.exports = mongoose.model('PDF', pdfSchema);
