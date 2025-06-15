/**
 * userTierRouter.js
 *
 * Global Entry Hub (GEH)
 * Tier-check API route, secured via JWT.
 *
 * Purpose:
 * Verifies user access level to ensure proper AI feature gating and compliance.
 */

const express = require('express');
const { getUserTier } = require('../controllers/userTierController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/user/tier
 * @desc    Returns user's subscription tier
 * @access  Private (JWT required)
 */
router.get('/tier', authenticate, getUserTier);

module.exports = router;
