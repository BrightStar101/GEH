/**
 * pdfDownloadAuditModel.js
 *
 * Global Entry Hub (GEH)
 * PDF Download Audit Schema (Upgraded)
 */

const mongoose = require('mongoose');

const PDFDownloadAuditSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Form',
      index: true,
    },
    downloadType: {
      type: String,
      enum: ['user', 'admin', 'system'],
      default: 'user',
      required: true,
      index: true,
    },
    ip: {
      type: String,
      default: 'unknown',
    },
    locale: {
      type: String,
      default: 'en',
    },
    geo: {
      city: { type: String, default: 'unknown' },
      region: { type: String, default: 'unknown' },
      country: { type: String, default: 'unknown', index: true },
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
      expires: 60 * 60 * 24 * 180,
    },
  },
  {
    timestamps: false,
    versionKey: false,
    collection: 'pdf_download_audit',
  }
);

module.exports = mongoose.model('PDFDownloadAudit', PDFDownloadAuditSchema);
