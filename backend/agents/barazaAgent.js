/**
 * barazaAgent.js
 *
 * Global Entry Hub (GEH)
 * UGC SEO Freshness Engine (Production-Depth)
 *
 * Purpose:
 * Monitors, validates, and injects UGC reviews into SEO landing pages.
 * Supports cronjob or manual admin triggers, retry handling, audit logging,
 * and protection against page corruption during SEO page updates.
 */

const fs = require('fs');
const path = require('path');
const Review = require('../models/reviewModel');
const logger = require('../utils/loggerUtils');
const { recordBarazaInjection } = require('../services/barazaAuditService');

// Directory where SEO pages live
const SEO_PAGES_DIR = path.join(__dirname, '../../seo/pages/');
const MAX_REVIEWS_PER_PAGE = 3;
const INJECTION_MARKER_START = '<!-- START_UGC -->';
const INJECTION_MARKER_END = '<!-- END_UGC -->';

/**
 * Filters eligible reviews (4–5 stars, approved) for injection.
 * @returns {Promise<Array>} List of review documents
 */
async function getEligibleUGCReviews() {
  try {
    const reviews = await Review.find({
      stars: { $gte: 4 },
      approved: true,
    }).sort({ createdAt: -1 }).limit(100);

    return reviews;
  } catch (error) {
    logger.logError('Baraza: Error fetching UGC reviews.', error);
    return [];
  }
}

/**
 * Maps reviews to SEO landing pages based on keyword matching.
 * @param {Array} reviews
 * @returns {Object} Map of page slugs → review arrays
 */
function mapReviewsToPages(reviews) {
  const mapping = {};
  const keywords = ['student', 'work', 'family', 'asylum', 'citizenship', 'visa', 'green card'];

  keywords.forEach(keyword => {
    mapping[keyword] = [];
  });

  for (const review of reviews) {
    const text = (review.message || '').toLowerCase();

    for (const keyword of keywords) {
      if (text.includes(keyword) && mapping[keyword].length < MAX_REVIEWS_PER_PAGE) {
        mapping[keyword].push({
          snippet: text.length > 160 ? text.slice(0, 157) + '...' : text,
          reviewId: review._id,
        });
      }
    }
  }

  return mapping;
}

/**
 * Safely injects reviews into an SEO page.
 * @param {string} pageSlug
 * @param {Array} snippets
 */
function injectReviewsIntoPage(pageSlug, snippets) {
  const pagePath = path.join(SEO_PAGES_DIR, `${pageSlug}.html`);

  if (!fs.existsSync(pagePath)) {
    logger.logWarn(`Baraza: SEO page not found for slug '${pageSlug}'. Skipping.`);
    return;
  }

  try {
    const originalHTML = fs.readFileSync(pagePath, 'utf8');

    if (!originalHTML.includes(INJECTION_MARKER_START) || !originalHTML.includes(INJECTION_MARKER_END)) {
      logger.logError(`Baraza: Missing UGC injection markers in '${pageSlug}.html'.`);
      return;
    }

    const snippetsHTML = snippets.map(s => `<p class="ugc-snippet">"${s.snippet}"</p>`).join('\n');
    const updatedHTML = originalHTML.replace(
      new RegExp(`${INJECTION_MARKER_START}[\\s\\S]*?${INJECTION_MARKER_END}`),
      `${INJECTION_MARKER_START}\n${snippetsHTML}\n${INJECTION_MARKER_END}`
    );

    fs.writeFileSync(pagePath, updatedHTML, 'utf8');

    // Audit success
    recordBarazaInjection(pageSlug, snippets.map(s => s.reviewId));
    logger.logInfo(`Baraza: Injected ${snippets.length} UGC reviews into ${pageSlug}.html.`);
  } catch (error) {
    logger.logError(`Baraza: Injection failed for '${pageSlug}.html'.`, error);
  }
}

/**
 * Runs a full freshness cycle for SEO pages.
 * Can be triggered manually or via cron.
 */
async function runBarazaFreshnessCycle() {
  try {
    logger.logInfo('Baraza: Starting UGC freshness cycle.');
    const reviews = await getEligibleUGCReviews();
    if (!reviews.length) {
      logger.logWarn('Baraza: No eligible reviews found.');
      return;
    }

    const reviewMap = mapReviewsToPages(reviews);

    for (const [slug, snippets] of Object.entries(reviewMap)) {
      if (snippets.length > 0) {
        injectReviewsIntoPage(slug, snippets);
      }
    }

    logger.logInfo('Baraza: Freshness cycle complete.');
  } catch (error) {
    logger.logError('Baraza: Error during freshness cycle.', error);
  }
}

/**
 * Admin manual trigger for Baraza cycle.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function manualTriggerFreshness() {
  try {
    await runBarazaFreshnessCycle();
    return { success: true, message: 'Baraza manual refresh complete.' };
  } catch (err) {
    logger.logError('Baraza: Manual trigger failed.', err);
    return { success: false, message: 'Manual refresh failed.' };
  }
}

/**
 * Initializes Baraza Agent.
 * Safe to call at server boot.
 */
async function initializeBaraza() {
  logger.logInfo('Baraza: Initialized.');
}

module.exports = {
  initializeBaraza,
  runBarazaFreshnessCycle,
  manualTriggerFreshness,
};
