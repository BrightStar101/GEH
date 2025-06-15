/**
 * adminOnlyMiddleware.js
 *
 * Global Entry Hub (GEH)
 * Middleware to restrict access to admin users only.
 *
 * Purpose:
 * Validates JWT token and enforces `role: 'admin'` access.
 * Applies to sensitive endpoints like OCR, log viewing, exports.
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware to restrict access to users with `role: 'admin'`
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express middleware continuation
 */
function adminOnlyMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error('AdminOnlyMiddleware: JWT validation failed', err.message);
    return res.status(401).json({ message: 'Unauthorized request' });
  }
}

module.exports = adminOnlyMiddleware;
