/**
 * seoRefreshRateLimiter.js
 *
 * Global Entry Hub (GEH)
 * Rate Limiter for Sitemap Refresh Route
 *
 * Purpose:
 * Prevents abuse or accidental rapid refresh of the sitemap
 * and associated Google/Bing ping triggers.
 */

const rateLimit = require('express-rate-limit');

/**
 * Refresh limiter: Max 3 requests per hour per IP
 */
const seoRefreshRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    message: 'Sitemap refresh limit exceeded. Try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { seoRefreshRateLimiter };
