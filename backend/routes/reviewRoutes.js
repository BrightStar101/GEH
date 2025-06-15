/**
 * reviewRoutes.js
 *
 * Global Entry Hub (GEH)
 * UGC Review Routes (Hardened)
 *
 * Routes:
 * - POST /reviews            → Submit a new review (rate-limited)
 * - GET /reviews             → Fetch public reviews (public)
 * - PATCH /reviews/:id/flag  → Flag review (JWT required)
 * - PUT /reviews/:id/publish → Admin-only publish toggle (JWT + Role enforced)
 */

const express = require('express');
const {
  submitReview,
  getPublicReviews,
  flagReview,
  publishReview,
} = require('../controllers/reviewController');

const { authenticate } = require('../middleware/authMiddleware');
const adminOnlyMiddleware = require('../middleware/adminOnlyMiddleware');
const { reviewRateLimiter } = require('../middleware/reviewRateLimiter');

const router = express.Router();

/**
 * @route POST /api/reviews
 * @desc Submits a new review
 * @access Public (rate-limited)
 */
router.post('/', authenticate, reviewRateLimiter, submitReview);

/**
 * @route GET /api/reviews
 * @desc Returns only published, unflagged reviews
 * @access Public
 */
router.get('/', authenticate, getPublicReviews);

/**
 * @route PATCH /api/reviews/:id/flag
 * @desc Flags a review for moderation
 * @access Private (JWT required to prevent abuse)
 */
router.patch('/:id/flag', authenticate, flagReview);

/**
 * @route PUT /api/reviews/:id/publish
 * @desc Marks a review as published (admin-only)
 * @access Private (JWT + Admin role required)
 */
router.put('/:id/publish', authenticate, adminOnlyMiddleware, publishReview);

module.exports = router;
