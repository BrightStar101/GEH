/**
 * webhookController.js
 *
 * Global Entry Hub (GEH)
 * Webhook Event Router (Stripe + PayPal)
 *
 * Purpose:
 * Receives and processes webhook events from Stripe and PayPal.
 * Validates authenticity, parses event type, and routes to
 * the appropriate processor for subscription lifecycle handling.
 */

const { validateStripeEvent } = require('../utils/stripeEventValidator');
const {
  processStripeEvent,
  processPaypalEvent,
} = require('../services/webhookProcessorService');

/**
 * Handles incoming Stripe webhook (live).
 */
async function handleStripeWebhook(req, res) {
  try {
    const signature = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    const event = validateStripeEvent({
      rawBody: req.body,
      signature,
      secret,
    });

    if (!event) {
      console.warn('Stripe Webhook: Invalid signature');
      return res.status(400).send('Invalid signature');
    }

    await processStripeEvent(event);
    return res.status(200).send('Received');
  } catch (err) {
    console.error('Stripe Webhook Error:', err.message);
    return res.status(200).send('Handled (error logged)');
  }
}

/**
 * Handles incoming Stripe test webhook.
 */
async function handleStripeTestWebhook(req, res) {
  try {
    const signature = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_TEST_SECRET;

    const event = validateStripeEvent({
      rawBody: req.body,
      signature,
      secret,
    });

    if (!event) {
      console.warn('Stripe Test Webhook: Invalid signature');
      return res.status(400).send('Invalid signature');
    }

    console.log('Stripe Test Webhook Event:', event.type);
    await processStripeEvent(event, { testMode: true });
    return res.status(200).send('Received (test)');
  } catch (err) {
    console.error('Stripe Test Webhook Error:', err.message);
    return res.status(200).send('Handled (test error logged)');
  }
}

/**
 * Handles incoming PayPal webhook.
 */
async function handlePaypalWebhook(req, res) {
  try {
    const event = req.body;

    if (!event || !event.event_type || !event.resource) {
      console.warn('PayPal Webhook: Malformed body');
      return res.status(400).send('Malformed event');
    }

    await processPaypalEvent(event);
    return res.status(200).send('Received');
  } catch (err) {
    console.error('PayPal Webhook Error:', err.message);
    return res.status(200).send('Handled (error logged)');
  }
}

module.exports = {
  handleStripeWebhook,
  handleStripeTestWebhook,
  handlePaypalWebhook,
};
