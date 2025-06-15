/**
 * moderationRateLimiter.js
 *
 * Global Entry Hub (GEH)
 * Rate Limiter for Admin Moderation Routes
 *
 * Purpose:
 * Prevents misuse of sensitive review actions (publish/flag).
 * Allows 10 moderation actions per 5 minutes per IP.
 */

const rateLimit = require('express-rate-limit');

const moderationRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: {
    message: 'Too many moderation actions from this IP. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  moderationRateLimiter,
};
