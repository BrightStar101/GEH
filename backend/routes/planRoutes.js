/**
 * planRoutes.js
 *
 * Tier Plan API Routes
 */

const express = require('express');
const {
  getUserPlanStatus,
  submitPlanUpgrade,
  getPlanEntitlements,
} = require('../controllers/planController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/check', authMiddleware, getUserPlanStatus);
router.get('/entitlements', getPlanEntitlements);
router.post('/upgrade', authMiddleware, submitPlanUpgrade);

module.exports = router;
