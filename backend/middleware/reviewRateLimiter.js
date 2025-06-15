/**
 * reviewRateLimiter.js
 *
 * Global Entry Hub (GEH)
 * Rate Limiting Middleware for UGC Review Submission
 *
 * Purpose:
 * Restricts public posting of reviews to prevent spam and abuse.
 */

const rateLimit = require('express-rate-limit');

/**
 * @function reviewRateLimiter
 * @desc Restricts review submissions to 5 requests per 10 minutes per IP
 * @returns {Function} Express middleware
 */
const reviewRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    message: 'Too many reviews submitted from this IP. Please wait and try again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.headers['x-forwarded-for'] || 'unknown',
});

module.exports = { reviewRateLimiter };
