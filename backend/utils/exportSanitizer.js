/**
 * exportSanitizer.js
 * Data Export Sanitization Utility for GEH
 * Strips internal-use fields before GDPR/CCPA exports
 */

const FIELDS_TO_STRIP = {
  reviews: ['_id', '__v', 'ipHash', 'moderationReason', 'flagged', 'published'],
  forms: ['_id', '__v', 'ipHash', 'internalNotes'],
  ocrScans: ['_id', '__v', 'confidenceScore', 'rawOutput', 'adminTags'],
};

function redactFields(entry, fields) {
  const sanitized = { ...entry };
  for (const key of fields) {
    delete sanitized[key];
  }
  return sanitized;
}

function sanitizeExportPayload(rawExport) {
  try {
    if (!rawExport || typeof rawExport !== 'object') {
      throw new Error('Invalid export object provided to sanitizer.');
    }

    const sanitized = {
      meta: rawExport.meta || {},
      reviews: Array.isArray(rawExport.reviews)
        ? rawExport.reviews.map((r) => redactFields(r, FIELDS_TO_STRIP.reviews))
        : [],
      forms: Array.isArray(rawExport.forms)
        ? rawExport.forms.map((f) => redactFields(f, FIELDS_TO_STRIP.forms))
        : [],
      ocrScans: Array.isArray(rawExport.ocrScans)
        ? rawExport.ocrScans.map((o) => redactFields(o, FIELDS_TO_STRIP.ocrScans))
        : [],
    };

    return sanitized;
  } catch (err) {
    console.error('ExportSanitizer: Failed to sanitize export object', err.message);
    throw new Error('Failed to sanitize export data.');
  }
}

module.exports = { sanitizeExportPayload };
