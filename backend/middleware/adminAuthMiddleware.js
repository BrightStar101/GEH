const jwt = require('jsonwebtoken');
const config = require('../config/config');

function adminAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error('AdminAuthMiddleware: JWT validation failed', err.message);
    return res.status(401).json({ message: 'Unauthorized request' });
  }
}

module.exports = adminAuthMiddleware;