/**
 * seoRedirectLogger.js
 *
 * Global Entry Hub (GEH)
 * SEO Redirect Logging Service
 *
 * Purpose:
 * Logs redirect events triggered from SEO domain farm entry points
 * to track crawlers, bots, real users, or redirect frequency by slug.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Logs an SEO redirect event to a simple flat file or logs pipeline.
 *
 * @param {Object} params
 * @param {string} params.slug - The slug/route of the redirect (e.g. visa-help)
 * @param {string} params.userAgent - User agent string from the request
 * @param {string} params.ip - IP address of the requester
 */
function logRedirectEvent({ slug, userAgent, ip }) {
  try {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] Redirect slug: ${slug} | IP: ${ip} | UA: ${userAgent}${os.EOL}`;

    const logPath = path.join(__dirname, '../../logs/seo-redirect-events.log');
    fs.appendFile(logPath, entry, (err) => {
      if (err) {
        console.error('SEO Redirect Logger: Failed to write to log file', err.message);
      }
    });
  } catch (err) {
    console.error('SEO Redirect Logger: Logging failed', err.message);
  }
}

module.exports = {
  logRedirectEvent,
};
