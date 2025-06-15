const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Logs access metadata for sitemap requests.
 *
 * @param {Object} params
 * @param {string} params.userAgent - User-agent from request header
 * @param {string} params.ip - IP address of the requester
 */
function logSitemapRequest({ userAgent, ip }) {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] Sitemap hit | IP: ${ip} | UA: ${userAgent}${os.EOL}`;

    const logPath = path.join(__dirname, '../../logs/sitemap-access.log');
    fs.appendFile(logPath, logEntry, (err) => {
      if (err) {
        console.error('SitemapLogger: Failed to write log entry', err.message);
      }
    });
  } catch (err) {
    console.error('SitemapLogger: Logging failed', err.message);
  }
}

module.exports = {
  logSitemapRequest,
};
