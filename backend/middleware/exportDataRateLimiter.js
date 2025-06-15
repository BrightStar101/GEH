/**
 * exportDataRateLimiter.js
 *
 * Global Entry Hub (GEH)
 * Rate Limiter for Data Export Endpoints
 *
 * Purpose:
 * Prevents repeated abuse of the user data export endpoint
 * by limiting requests to once per hour per authenticated user/IP.
 */

const rateLimit = require('express-rate-limit');

/**
 * Limits GDPR/CCPA export requests:
 * - Max 1 export per hour per IP
 * - Applies to: /support/export-my-data
 */
const exportDataRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1, // Only one export request per window
  message: {
    message: 'You may only request a data export once per hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { exportDataRateLimiter };
