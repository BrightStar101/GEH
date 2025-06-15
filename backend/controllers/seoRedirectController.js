/**
 * seoRedirectController.js
 *
 * Global Entry Hub (GEH)
 * SEO Redirect Controller (Patched with Redirect Logging)
 *
 * Purpose:
 * Serves Open Graph-optimized pages with a 3-second redirect for SEO domain farm ingestion.
 * Also logs redirect access metadata (IP, user-agent, slug) for crawl and bot tracking.
 */

const { logRedirectEvent } = require('../services/seoRedirectLogger');

const VALID_REDIRECT_DESTINATIONS = [
  '/visa-help',
  '/asylum-support',
  '/student-immigration',
  '/family-reunification',
  '/employment-entry',
];

/**
 * GET /seo-redirect/:slug
 * Delivers HTML page with SEO meta tags and a 3-second refresh redirect.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function seoRedirectHandler(req, res) {
  try {
    const { slug } = req.params;

    const cleanSlug = `/${slug}`.toLowerCase().trim();
    const isValid = VALID_REDIRECT_DESTINATIONS.includes(cleanSlug);
    const destination = isValid ? cleanSlug : '/';

    const baseUrl = 'https://www.globalentryhub.com';
    const fullUrl = `${baseUrl}${destination}`;
    const pageTitle = `Immigration Support — ${slug.replace(/-/g, ' ').toUpperCase()}`;
    const description = `Global Entry Hub helps individuals and families with immigration services like ${slug.replace(/-/g, ' ')}.`;

    logRedirectEvent({
      slug,
      userAgent: req.headers['user-agent'] || 'unknown',
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    });

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <meta http-equiv="refresh" content="3;url=${fullUrl}" />

        <title>${pageTitle}</title>
        <meta name="description" content="${description}" />
        <link rel="canonical" href="${fullUrl}" />

        <!-- Open Graph -->
        <meta property="og:title" content="${pageTitle}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:image" content="${baseUrl}/assets/seo/og-cover-${slug}.jpg" />
        <meta property="og:url" content="${fullUrl}" />
        <meta property="og:type" content="website" />

        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${pageTitle}" />
        <meta name="twitter:description" content="${description}" />
        <meta name="twitter:image" content="${baseUrl}/assets/seo/og-cover-${slug}.jpg" />

        <style>
          body { font-family: sans-serif; text-align: center; padding: 2rem; }
        </style>
      </head>
      <body>
        <h1>Redirecting you to ${destination}...</h1>
        <p>If you're not redirected in 3 seconds, <a href="${fullUrl}">click here</a>.</p>
      </body>
      </html>
    `;

    res.status(200).send(html);
  } catch (err) {
    console.error('SEO Redirect Controller: Failed redirect', err.message);
    res.status(500).send('SEO redirect failed.');
  }
}

module.exports = {
  seoRedirectHandler,
};
