/**
 * formLimiter.js
 *
 * Global Entry Hub (GEH)
 * IP-based rate limiting middleware for form submission and download endpoints.
 *
 * Purpose:
 * - Protects form POSTs from spam and automation abuse
 * - Protects PDF downloads from scraping and throttles file generation
 * - Applies reusable limiters per route intent (submission vs. download)
 */

const rateLimit = require('express-rate-limit');

// Rate limiter for form submissions (POST /api/forms)
// Allows 5 form submissions per minute per IP
const formSubmissionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5,
  message: {
    message: 'Too many form submissions from this IP. Please wait before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for PDF downloads (GET /api/forms/:id/download)
 * Allows 3 downloads per minute per IP
 */
const formDownloadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: {
    message: 'Download rate limit exceeded. Please wait before accessing more PDFs.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  formSubmissionLimiter,
  formDownloadLimiter,
};
