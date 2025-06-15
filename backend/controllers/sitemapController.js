/**
 * sitemapController.js
 *
 * Global Entry Hub (GEH)
 * SEO Sitemap Controller (Final)
 *
 * Purpose:
 * Generates and caches sitemap.xml for SEO crawlers.
 * Pulls dynamic slugs from reviews, filters blacklisted slugs,
 * logs access events, supports manual refresh, and notifies search engines.
 */

const Review = require('../models/reviewModel');
const fetch = require('node-fetch');
const { logSitemapRequest } = require('../services/sitemapLogger');

let cachedSitemap = null;
let lastGenerated = null;
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const baseUrl = 'https://www.globalentryhub.com';

const STATIC_PAGES = ['/', '/support', '/dashboard', '/pdf-help', '/ocr'];
const SEARCH_ENGINES = [
  `https://www.google.com/ping?sitemap=${baseUrl}/sitemap.xml`,
  `https://www.bing.com/ping?sitemap=${baseUrl}/sitemap.xml`,
];
const REGION_CODES = ['us', 'ca', 'uk'];
const SLUG_BLACKLIST = ['test', 'temp', 'demo', 'sample', 'placeholder'];

/**
 * Generates sitemap-compliant XML output from a list of URLs.
 * @param {string[]} urls
 * @returns {string}
 */
function generateSitemapXml(urls) {
  const now = new Date().toISOString();
  const urlSet = urls
    .map((url) => {
      return `
        <url>
          <loc>${baseUrl}${url}</loc>
          <lastmod>${now}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urlSet}
  </urlset>`;
}

/**
 * Pings major search engines to notify them of sitemap updates.
 */
async function pingSearchEngines() {
  for (const url of SEARCH_ENGINES) {
    try {
      await fetch(url);
    } catch (err) {
      console.error(`SitemapController: Failed to ping ${url}`, err.message);
    }
  }
}

/**
 * Gets dynamic SEO route slugs based on review categories and supported regions,
 * excluding any slugs listed in the blacklist.
 * @returns {Promise<string[]>}
 */
async function getSeoUrlsFromDb() {
  const categories = await Review.distinct('category', {
    published: true,
    flagged: false,
  });

  return categories
    .filter((cat) => !SLUG_BLACKLIST.includes(cat.toLowerCase()))
    .flatMap((cat) =>
      REGION_CODES.map((region) => `/seo/${cat}-help-${region}`)
    );
}

/**
 * GET /sitemap.xml
 * Public route that returns cached or freshly generated sitemap XML.
 * Logs bot access for SEO analytics.
 */
async function serveSitemapXml(req, res) {
  try {
    logSitemapRequest({
      userAgent: req.headers['user-agent'] || 'unknown',
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    });

    const now = Date.now();
    if (cachedSitemap && lastGenerated && now - lastGenerated < CACHE_DURATION_MS) {
      res.set('Content-Type', 'application/xml');
      return res.status(200).send(cachedSitemap);
    }

    const seoUrls = await getSeoUrlsFromDb();
    const allUrls = [...STATIC_PAGES, ...seoUrls];

    const sitemapXml = generateSitemapXml(allUrls);
    cachedSitemap = sitemapXml;
    lastGenerated = now;

    await pingSearchEngines();

    res.set('Content-Type', 'application/xml');
    res.status(200).send(sitemapXml);
  } catch (err) {
    console.error('SitemapController: Failed to serve sitemap', err.message);
    res.status(500).send('Sitemap generation failed');
  }
}

/**
 * GET /api/sitemap/refresh
 * Admin-only route to force sitemap rebuild + ping.
 */
async function refreshSitemapCache(req, res) {
  try {
    const seoUrls = await getSeoUrlsFromDb();
    const allUrls = [...STATIC_PAGES, ...seoUrls];

    const sitemapXml = generateSitemapXml(allUrls);
    cachedSitemap = sitemapXml;
    lastGenerated = Date.now();

    await pingSearchEngines();

    res.status(200).json({ message: 'Sitemap cache rebuilt and search engines pinged.' });
  } catch (err) {
    console.error('SitemapController: Refresh failed', err.message);
    res.status(500).json({ message: 'Manual sitemap refresh failed' });
  }
}

module.exports = {
  serveSitemapXml,
  refreshSitemapCache,
};
