/**
 * seoRateLimiter.js
 *
 * Global Entry Hub (GEH)
 * SEO Route Rate Limiting Middleware
 *
 * Purpose:
 * Protects public SEO endpoints from bot abuse, scraping, and overload
 * while allowing safe crawl access by real search engines.
 */

const rateLimit = require('express-rate-limit');

/**
 * Custom function to allowlist well-known bots (e.g., Googlebot, Bingbot).
 * Returns true if the request should be limited.
 *
 * @param {Object} req
 * @returns {boolean}
 */
function shouldRateLimit(req) {
  const ua = req.headers['user-agent'] || '';
  const allowlistedBots = ['Googlebot', 'Bingbot', 'DuckDuckBot', 'AhrefsBot'];

  return !allowlistedBots.some((bot) => ua.includes(bot));
}

/**
 * SEO route rate limiter — 60 requests per 1 minute per IP,
 * but skips bots we trust for SEO crawling.
 */
const seoRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Max 60 requests per IP per minute
  skip: (req) => !shouldRateLimit(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from your IP. Please wait and try again shortly.',
  },
});

module.exports = { seoRateLimiter };
