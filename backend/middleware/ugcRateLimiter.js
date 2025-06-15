/**
 * ugcRateLimiter.js
 *
 * Global Entry Hub (GEH)
 * Rate Limiting Middleware for Public Story Submission (UGC)
 *
 * Purpose:
 * Prevents spam and abuse of public story sharing endpoint by limiting per-IP requests.
 */

const rateLimit = require('express-rate-limit');

/**
 * @function ugcRateLimiter
 * @desc Restricts UGC submissions to 5 requests per 10 minutes per IP
 * @returns {Function} Express middleware
 */
const ugcRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    message: 'Too many stories submitted from this IP. Please wait and try again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.headers['x-forwarded-for'] || 'unknown',
});

module.exports = {
  ugcRateLimiter,
};
