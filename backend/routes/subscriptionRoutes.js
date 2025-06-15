const express = require('express');
const router = express.Router();

const {
  checkSubscription,
  activateSubscription,
  getBillingPortal,
} = require('../controllers/subscriptionController');

const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/check', authMiddleware, checkSubscription);
router.post('/activate', authMiddleware, activateSubscription);
router.get('/portal', authMiddleware, getBillingPortal);

module.exports = router;
