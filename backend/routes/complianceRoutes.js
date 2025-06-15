/**
 * complianceRoutes.js
 *
 * Routes for GDPR, CCPA, and user-facing compliance tools
 */

const express = require('express');
const { exportDataRateLimiter } = require('../middleware/exportDataRateLimiter');
const { exportMyData } = require('../controllers/exportDataController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/export-my-data', authMiddleware, exportDataRateLimiter, exportMyData);

module.exports = router;
