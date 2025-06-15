/**
 * rateLimiter.js
 *
 * Global Entry Hub (GEH)
 * Fallback IP-based Rate Limiter
 *
 * Purpose:
 * Applies generic IP throttling to public POST endpoints like
 * /api/debugger/logLanguageFallback to prevent abuse.
 */

const rateLimit = require('express-rate-limit');

/**
 * fallbackLimiter
 *
 * Applies IP-based rate limiting to anonymous public POST routes such as
 * /api/debugger/logLanguageFallback.
 *
 * Default config:
 * - Max 10 requests per minute per IP
 * - 429 status if exceeded
 * - Generic message (no detailed feedback to discourage probing)
 */
const fallbackLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // limit each IP to 10 requests per windowMs
  standardHeaders: true, // Include rate limit headers
  legacyHeaders: false,  // Disable deprecated headers
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  skipSuccessfulRequests: false,
});

module.exports = { fallbackLimiter, rateLimiter: rateLimit };
