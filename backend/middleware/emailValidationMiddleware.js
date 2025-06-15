/**
 * backend/middleware/emailValidationMiddleware.js
 *
 * Global Entry Hub (GEH)
 * Batch 34 – Outreach Integration & Email Metadata
 *
 * Purpose:
 * Middleware to validate outbound email metadata before it's logged.
 * Prevents malformed logs, invalid status codes, or unapproved template IDs.
 */

const { logWarn, logError } = require('../utils/loggerUtils');
const emailMetadataFields = require('../config/emailMetadataFields.json');

/**
 * Middleware to validate the structure and values of an email log request.
 * Applies to internal logging routes or SendGrid webhook inputs.
 * Assumes JSON body payload.
 */
function validateEmailLogFields(req, res, next) {
  try {
    const {
      email,
      templateId,
      language,
      status,
      wave,
      funnelStage,
    } = req.body;

    const errors = [];

    // Required fields
    if (!email || !email.includes('@')) {
      errors.push('Invalid or missing email address.');
    }

    if (!templateId || typeof templateId !== 'string') {
      errors.push('Missing or invalid templateId.');
    }

    if (!language || !['en', 'es', 'hi', 'zh'].includes(language)) {
      errors.push('Unsupported or missing language.');
    }

    if (!status || !emailMetadataFields.statuses.includes(status)) {
      errors.push(`Invalid status. Allowed: ${emailMetadataFields.statuses.join(', ')}`);
    }

    // Optional fields
    if (wave && !emailMetadataFields.allowedWaves.includes(parseInt(wave))) {
      errors.push(`Invalid wave ID. Must be one of: ${emailMetadataFields.allowedWaves.join(', ')}`);
    }

    if (funnelStage && !emailMetadataFields.funnelStages.includes(funnelStage)) {
      errors.push(`Invalid funnelStage. Must be one of: ${emailMetadataFields.funnelStages.join(', ')}`);
    }

    if (errors.length > 0) {
      logWarn('Email log validation failed:', errors);
      return res.status(400).json({ success: false, errors });
    }

    return next();
  } catch (err) {
    logError('Email log validation middleware error:', err.message);
    return res.status(500).json({ success: false, message: 'Internal email validation error.' });
  }
}

module.exports = validateEmailLogFields;
