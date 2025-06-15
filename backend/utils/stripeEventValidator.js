const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Validates a Stripe webhook event using the signature.
 * @param {Object} options
 * @param {Buffer} options.rawBody
 * @param {string} options.signature
 * @param {string} options.secret
 * @returns {Object|null}
 */
function validateStripeEvent({ rawBody, signature, secret }) {
  try {
    if (!rawBody || !signature || !secret) {
      throw new Error('Missing webhook validation data');
    }

    const event = stripe.webhooks.constructEvent(rawBody, signature, secret);
    return event;
  } catch (err) {
    console.error('StripeEventValidator: Signature validation failed:', err.message);
    return null;
  }
}

module.exports = {
  validateStripeEvent,
};
