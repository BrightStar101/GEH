const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const {
  handleStripeWebhook,
  handleStripeTestWebhook,
  handlePaypalWebhook,
} = require('../controllers/webhookController');

const { handleSendGridWebhook } = require('../controllers/sendgridWebhookController');

const { webhookRateLimiter } = require('../middleware/webhookRateLimiter');
const verifySendGridIp = require('../middleware/verifySendGridIp');

// Stripe — raw body required
router.post(
  '/stripe',
  webhookRateLimiter,
  bodyParser.raw({ type: 'application/json' }),
  handleStripeWebhook
);

router.post(
  '/stripe/test',
  webhookRateLimiter,
  bodyParser.raw({ type: 'application/json' }),
  handleStripeTestWebhook
);

// PayPal — normal body
router.post(
  '/paypal',
  webhookRateLimiter,
  express.json(),
  handlePaypalWebhook
);

// SendGrid — IP-filtered JSON body
router.post(
  '/sendgrid',
  webhookRateLimiter,
  verifySendGridIp,
  express.json(),
  handleSendGridWebhook
);

module.exports = router;
