/**
 * seoController.js
 *
 * Global Entry Hub (GEH)
 * SEO Controller (with region fallback, review filter, meta generation)
 *
 * Purpose:
 * Handles serving SEO-optimized landing page content for region- and category-specific routes.
 * Returns meta tags, filtered reviews, and fallback content for unknown routes.
 */

const Review = require('../models/reviewModel');

const defaultRegion = 'global';
const supportedRegions = ['us', 'ca', 'uk', 'in', 'mx', 'global'];
const supportedLanguages = ['en', 'es', 'hi', 'zh', 'ar'];

/**
 * GET /api/seo/:slug
 * Returns data for an SEO landing page with region fallback logic.
 *
 * @param {Object} req
 * @param {Object} res
 */
async function serveStaticSeoPage(req, res) {
  try {
    const { slug } = req.params;
    const lang = req.query.lang?.toLowerCase() || 'en';

    const [base, region] = slug.split('-help-');
    const category = base || 'general';
    const resolvedRegion = supportedRegions.includes(region) ? region : defaultRegion;
    const language = supportedLanguages.includes(lang) ? lang : 'en';

    const reviews = await Review.find({
      published: true,
      flagged: false,
      category,
      language,
    })
      .sort({ timestamp: -1 })
      .limit(5)
      .lean();

    const meta = generateMetaTags({
      title: `Immigration Help for ${resolvedRegion.toUpperCase()}`,
      description: `See how others found success getting their ${category} support in ${resolvedRegion.toUpperCase()}.`,
      slug,
    });

    res.status(200).json({
      region: resolvedRegion,
      language,
      category,
      meta,
      reviews,
    });
  } catch (err) {
    console.error('SEOController: Failed to serve SEO page', err.message);
    res.status(500).json({ message: 'Failed to load SEO content.' });
  }
}

/**
 * Returns Open Graph + Twitter meta tag content based on SEO route context.
 *
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.description
 * @param {string} options.slug
 * @returns {Object}
 */
function generateMetaTags({ title, description, slug }) {
  const baseUrl = 'https://www.globalentryhub.com';
  const image = `${baseUrl}/assets/seo/og-cover-${slug || 'default'}.jpg`;

  return {
    title,
    description,
    og: {
      title,
      type: 'website',
      image,
      url: `${baseUrl}/seo/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@globalentryhub',
      title,
      description,
      image,
    },
  };
}

/**
 * GET /api/seo/reviews/:category
 * Returns published reviews for a given category and optional language.
 *
 * @param {Object} req
 * @param {Object} res
 */
async function fetchRegionSpecificReviews(req, res) {
  try {
    const { category } = req.params;
    const { lang = 'en' } = req.query;

    const reviews = await Review.find({
      published: true,
      flagged: false,
      category,
      language: lang,
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    res.status(200).json({ reviews });
  } catch (err) {
    console.error('SEOController: Failed to fetch reviews by category', err.message);
    res.status(500).json({ message: 'Failed to load filtered reviews.' });
  }
}

module.exports = {
  serveStaticSeoPage,
  fetchRegionSpecificReviews,
  generateMetaTags,
};
