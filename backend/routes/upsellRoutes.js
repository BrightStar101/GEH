const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const {
  upgradeSingleFileLifetime,
  upgradeAllFilesLifetime,
  handleStripeWebhook,
} = require('../controllers/upsellController');

const router = express.Router();

router.post('/upgrade/:fileId', requireAuth, upgradeSingleFileLifetime);
router.post('/upgrade-all', requireAuth, upgradeAllFilesLifetime);
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
