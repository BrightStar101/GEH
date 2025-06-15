/**
 * ocrRateLimiter.js
 *
 * Global Entry Hub (GEH)
 * Rate Limiting Middleware for OCR Upload Endpoint
 *
 * Purpose:
 * Prevents abuse of OCR-related endpoints by enforcing a per-IP request cap.
 * Limits are configurable and audit-friendly.
 */

const rateLimit = require('express-rate-limit');

/**
 * @function ocrRateLimiter
 * @desc Express middleware that restricts OCR upload frequency by IP.
 * Applies a limit of 5 requests per IP per minute by default.
 *
 * @returns {Function} Express middleware
 */
const ocrRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5,
  message: {
    message: 'Too many OCR requests from this IP. Please wait and try again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
});

module.exports = {
  ocrRateLimiter,
};
