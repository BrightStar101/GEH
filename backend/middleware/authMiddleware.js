/**
 * authMiddleware.js
 *
 * Global Entry Hub (GEH)
 * Middleware for verifying JWT and attaching decoded user
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/loggerUtils');
const { body, validationResult } = require('express-validator');

/**
 * authenticate
 *
 * Express middleware to verify JWT and attach decoded user payload to req.user.
 * Blocks unauthorized or malformed tokens and returns a 401 error.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Missing or invalid authorization token.' });
    }

    // Replace with your real secret key or use environment variable
    const JWT_SECRET = process.env.JWT_SECRET || 'geh_default_secret';

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || !decoded.id || !decoded.role) {
      return res.status(403).json({ success: false, message: 'Token does not contain required user fields.' });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email || null,
      role: decoded.role,
      planTier: decoded.planTier
    };

    return next();
  } catch (err) {
    logger.logWarn('JWT authentication failed:', err);
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token.' });
  }
}

/**
 * authenticateAdmin
 *
 * Express middleware to verify JWT and attach decoded user payload to req.user.
 * Blocks unauthorized or malformed tokens and returns a 401 error.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
function authenticateAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Admin role needed.' });
  }

  return next();
}

// Middleware to validate user registration input
const validateRegistration = [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

// Middleware to validate user login input
const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];


module.exports = {
  authenticate,
  authenticateAdmin,
  validateRegistration,
  validateLogin,
};
