/**
 * adminCheckMiddleware.js
 *
 * Protects admin-only endpoints by verifying JWT user role.
 * Requires authentication middleware to run before this.
 */

const { logError } = require('../utils/loggerUtils');

/**
 * Middleware that blocks non-admin users from accessing protected routes
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
function requireAdmin(req, res, next) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      logError('⛔ Unauthorized admin access attempt', {
        path: req.originalUrl,
        user: req.user?.email || 'anonymous',
      });

      return res.status(403).json({
        success: false,
        message: 'Admin access required.',
      });
    }

    return next();
  } catch (err) {
    logError('❌ Admin middleware failed', err);
    return res.status(500).json({
      success: false,
      message: 'Internal error in admin authorization.',
    });
  }
}

module.exports = { requireAdmin };
