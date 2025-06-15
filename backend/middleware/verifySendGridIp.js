/**
 * verifySendGridIp.js
 *
 * Global Entry Hub (GEH)
 * Batch 35 – Email Dispatch & Webhook System
 *
 * Purpose:
 * Middleware that restricts SendGrid webhook access to trusted IP addresses.
 * Adds launch-grade protection against spoofed or unauthorized requests.
 */

const { logInfo, logWarn } = require('../utils/loggerUtils');

/**
 * List of known SendGrid IP address prefixes.
 * Reference: https://sendgrid.com/docs/glossary/sendgrid-ips/
 * Last confirmed: 2025-05-11
 */
const sendgridAllowedPrefixes = [
  '149.72.',    // SendGrid US East
  '167.89.',    // SendGrid Global (main)
  '198.21.',    // SendGrid Legacy Blocks
  '192.254.',   // SendGrid EU Blocks
  '50.31.',     // SendGrid misc infra
];

/**
 * Extracts the originating IP from request headers or connection.
 * Handles proxies, load balancers, and direct connections.
 * @param {Object} req - Express request object
 * @returns {String} IPv4 address (best-effort)
 */
function extractClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) {
    return xff.split(',')[0].trim();
  }
  return req.connection?.remoteAddress || req.ip;
}

/**
 * Express middleware that permits only verified SendGrid IP addresses.
 * Logs both valid and rejected requests for audit traceability.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next() middleware function
 */
function verifySendGridIp(req, res, next) {
  const clientIp = extractClientIp(req);

  const isAllowed = sendgridAllowedPrefixes.some(prefix => clientIp.startsWith(prefix));

  if (!isAllowed) {
    logWarn(`Rejected SendGrid webhook from unauthorized IP: ${clientIp}`);
    return res.status(403).json({
      success: false,
      message: 'Access denied. Unrecognized sender IP.',
    });
  }

  logInfo(`Accepted SendGrid webhook from IP: ${clientIp}`);
  return next();
}

module.exports = verifySendGridIp;
