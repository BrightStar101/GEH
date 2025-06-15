/**
 * ocrAuditModel.js
 *
 * Global Entry Hub (GEH)
 * OCR Event Audit Model
 *
 * Purpose:
 * Logs metadata for each OCR request, including success/failure,
 * file type, language hint, and optional confidence score.
 */

const mongoose = require('mongoose');

const ocrAuditSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
      expires: 60 * 60 * 24 * 90, // 90 days
    },
    fileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    languageHint: {
      type: String,
      default: 'en',
    },
    success: {
      type: Boolean,
      default: false,
    },
    confidence: {
      type: Number,
      default: null,
    },
  },
  {
    collection: 'ocr_audit_logs',
    versionKey: false,
  }
);

module.exports = mongoose.model('OcrAuditLog', ocrAuditSchema);
