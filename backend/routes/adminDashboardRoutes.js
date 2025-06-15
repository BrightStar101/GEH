/**
 * adminDashboardRoutes.js
 *
 * Global Entry Hub (GEH)
 * Admin Dashboard API Routes
 */

const express = require('express');
const {
  getImpactMetrics,
  getModerationQueue,
  publishReview,
  flagReview,
  updateModerationNotes,
} = require('../controllers/adminDashboardController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminOnlyMiddleware } = require('../middleware/adminOnlyMiddleware');
const { moderationRateLimiter } = require('../middleware/moderationRateLimiter');

const router = express.Router();

router.get('/impact', authMiddleware, adminOnlyMiddleware, getImpactMetrics);
router.get('/moderation', authMiddleware, adminOnlyMiddleware, getModerationQueue);
router.put('/review/:id/publish', authMiddleware, adminOnlyMiddleware, moderationRateLimiter, publishReview);
router.patch('/review/:id/flag', authMiddleware, adminOnlyMiddleware, moderationRateLimiter, flagReview);
router.patch('/review/:id/notes', authMiddleware, adminOnlyMiddleware, moderationRateLimiter, updateModerationNotes);

module.exports = router;
