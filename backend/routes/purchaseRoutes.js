/**
 * purchaseRoutes.js
 *
 * Global Entry Hub (GEH)
 * Purchase and Access Tier Routes
 *
 * Purpose:
 * Manages all API interactions related to user purchases including:
 * - Tier unlocks
 * - Transaction validation
 * - Retry-safe logic
 *
 * Auth: JWT required
 */

const express = require('express');
const {
  purchaseTier,
  getPurchaseHistory,
  retryPurchase,
  validateTierAccess,
} = require('../controllers/purchaseController');

const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route POST /api/purchase/tier
 * @desc Purchases a new tier (e.g., $5, $25, $75)
 * @access Private (JWT required)
 */
router.post('/tier', authenticate, async (req, res, next) => {
  try {
    const result = await purchaseTier(req.user, req.body);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[Purchase] Tier Purchase Failed:', err.message);
    return next(err);
  }
});

/**
 * @route GET /api/purchase/history
 * @desc Returns all past purchases by the user
 * @access Private (JWT required)
 */
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const history = await getPurchaseHistory(req.user.id);
    return res.status(200).json({ purchases: history });
  } catch (err) {
    console.error('[Purchase] History Fetch Failed:', err.message);
    return next(err);
  }
});

/**
 * @route POST /api/purchase/retry
 * @desc Attempts to retry a failed purchase
 * @access Private (JWT required)
 */
router.post('/retry', authenticate, async (req, res, next) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId || typeof transactionId !== 'string') {
      return res.status(400).json({ message: 'Invalid transaction ID' });
    }
    const retry = await retryPurchase(req.user.id, transactionId);
    return res.status(200).json(retry);
  } catch (err) {
    console.error('[Purchase] Retry Failed:', err.message);
    return next(err);
  }
});

/**
 * @route GET /api/purchase/validate
 * @desc Confirms if the user has access to AI features based on tier
 * @access Private (JWT required)
 */
router.get('/validate', authenticate, async (req, res, next) => {
  try {
    const status = await validateTierAccess(req.user.id);
    return res.status(200).json(status);
  } catch (err) {
    console.error('[Purchase] Access Validation Failed:', err.message);
    return next(err);
  }
});

module.exports = router;
