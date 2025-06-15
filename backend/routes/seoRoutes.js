/**
 * seoRoutes.js
 *
 * Global Entry Hub (GEH)
 * SEO + Domain Visibility Routes
 *
 * Purpose:
 * Wires all SEO-facing functionality:
 * - JSON landing page builders
 * - Meta tag rendering
 * - Regional review filtering
 * - 3-second crawler-optimized redirects for domain farm ingestion
 */

const express = require('express');
const {
  serveStaticSeoPage,
  fetchRegionSpecificReviews,
  generateMetaTags,
} = require('../controllers/seoController');

const {
  seoRedirectHandler,
} = require('../controllers/seoRedirectController');

const router = express.Router();

/**
 * @route GET /api/seo/:slug
 * @desc Renders full landing page payload for SEO page (meta, reviews, etc.)
 * @access Public
 */
router.get('/:slug', serveStaticSeoPage);

/**
 * @route GET /api/seo/reviews/:category
 * @desc Returns language-specific published reviews by category (e.g. visa, asylum)
 * @access Public
 */
router.get('/reviews/:category', fetchRegionSpecificReviews);

/**
 * @route GET /api/seo/meta/:slug
 * @desc Returns Open Graph + Twitter meta tag structure for pre-rendering
 * @access Public
 */
router.get('/meta/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const meta = generateMetaTags({
      title: `Immigration Help — ${slug.replace(/-/g, ' ').toUpperCase()}`,
      description: `Trusted immigration support content related to ${slug.replace(/-/g, ' ')}`,
      slug,
    });
    res.status(200).json({ meta });
  } catch (err) {
    console.error('SEO Meta Route Error:', err.message);
    res.status(500).json({ message: 'Meta tag generation failed' });
  }
});

/**
 * @route GET /seo-redirect/:slug
 * @desc Returns HTML page with OG tags and JavaScript redirect after 3 seconds
 * @access Public (used by SEO domain farm)
 */
router.get('/seo-redirect/:slug', seoRedirectHandler);

module.exports = router;
