/**
 * sitemapRoutes.js
 *
 * Global Entry Hub (GEH)
 * Sitemap Routing Module (Final)
 *
 * Purpose:
 * - Serves cached sitemap to crawlers
 * - Enables admin-only refresh of sitemap with rate limiting
 */

const express = require('express');
const router = express.Router();

const {
  serveSitemapXml,
  refreshSitemapCache,
} = require('../controllers/sitemapController');

const { authMiddleware } = require('../middleware/authMiddleware');
const { adminOnlyMiddleware } = require('../middleware/adminOnlyMiddleware');
const { seoRefreshRateLimiter } = require('../middleware/seoRefreshRateLimiter');

/**
 * @route GET /sitemap.xml
 * @desc Returns cached or newly built sitemap.xml
 * @access Public (for Google, Bing, etc.)
 */
router.get('/sitemap.xml', serveSitemapXml);

/**
 * @route GET /api/sitemap/refresh
 * @desc Admin-only refresh trigger for sitemap rebuild + pings
 * @access Private (JWT + admin-only + rate-limited)
 */
router.get(
  '/api/sitemap/refresh',
  authMiddleware,
  adminOnlyMiddleware,
  seoRefreshRateLimiter,
  refreshSitemapCache
);

module.exports = router;
