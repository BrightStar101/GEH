/**
 * exportConfig.js
 *
 * Centralized settings for moderation export functionality.
 * Used to control output formats, enforce field-level data privacy,
 * and ensure DSAR-compliant exports under GDPR/CCPA.
 */

const exportConfig = {
  supportedFormats: ["csv", "json"],

  dsarAnonymization: {
    enabled: true,
    removeFields: ["createdBy", "reviewedBy", "reviewerNotes"],
    maskPatterns: {
      originalText: (text) => text.length > 200 ? text.slice(0, 200) + "…" : text,
    },
  },

  allowedExportFields: [
    "_id",
    "status",
    "createdAt",
    "langCode",
    "source",
    "highestTier",
    "autoEscalated",
    "matches",
    "history",
    "deletedAt",
  ],

  maxExportRows: 5000,
};

module.exports = exportConfig;
