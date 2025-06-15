/**
 * adminAccessGuard.js
 *
 * Global Entry Hub (GEH)
 * Admin Route Access Middleware (With Logging)
 *
 * Purpose:
 * Restricts access to admin-only routes and logs all denied attempts
 * into a structured `admin-access.log` for security review.
 */

const fs = require('fs');
const path = require('path');

/**
 * Middleware to restrict admin-only routes.
 * Logs blocked access attempts for audit purposes.
 */
function adminOnlyMiddleware(req, res, next) {
  try {
    const user = req.user;

    if (!user || user.role !== 'admin') {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] BLOCKED admin route → user=${user?.id || 'unknown'} role=${user?.role || 'none'} path=${req.originalUrl}\n`;
      const logPath = path.join(__dirname, '../../logs/admin-access.log');

      try {
        fs.appendFileSync(logPath, logEntry);
      } catch (logErr) {
        console.error('AdminOnlyMiddleware: Failed to write access log', logErr.message);
      }

      return res.status(403).json({
        message: 'Access denied. Admin role required.',
      });
    }

    next(); // Authorized
  } catch (err) {
    console.error('AdminOnlyMiddleware Error:', err.message);
    return res.status(500).json({
      message: 'Admin access check failed. Please try again.',
    });
  }
}

module.exports = adminOnlyMiddleware;
