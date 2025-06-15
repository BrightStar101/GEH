/**
 * webhookRateLimiter.js
 *
 * Global Entry Hub (GEH)
 * Rate-limiting middleware to protect webhook entrypoints
 * like SendGrid, Stripe, and PayPal from excessive event flooding.
 * Throttles requests per IP or header within a fixed window.
 */

const rateLimit = require('express-rate-limit');
const { logWarn } = require('../utils/loggerUtils');

/**
 * Express rate limiter for webhook endpoints
 * - Limit: 5 requests per 10 seconds per IP
 * - Blocked requests are logged for security audit
 */
const webhookRateLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logWarn("⚠️ Webhook rate limit triggered", {
      ip: req.ip,
      route: req.originalUrl,
      userAgent: req.headers["user-agent"],
      time: new Date().toISOString(),
    });

    res.status(429).json({
      success: false,
      message: "Too many webhook requests. Please try again later.",
    });
  },
});

module.exports = { webhookRateLimiter };
