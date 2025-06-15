/**
 * subscriptionController.js
 *
 * Global Entry Hub (GEH)
 * Subscription API Controller for Kairo & Lumo (Enriched)
 */

const { getSubscriptionStatus } = require('../services/subscriptionService');
const { createBillingPortalSession } = require('../services/billingPortalService');
const Subscription = require('../models/subscriptionModel');

const PLAN_METADATA = {
  kairo: {
    base: { label: 'Kairo Base', price: 9 },
    pro: { label: 'Kairo Pro', price: 19 },
  },
  lumo: {
    base: { label: 'Lumo Base', price: 9 },
    pro: { label: 'Lumo Pro', price: 19 },
  },
};

/**
 * GET /api/subscription/check?product=kairo|lumo
 */
async function checkSubscription(req, res) {
  try {
    const userId = req.user?.id;
    const product = req.query.product;

    if (!userId || !product) {
      return res.status(400).json({ message: 'Missing user or product context' });
    }

    const result = await getSubscriptionStatus({ userId, product });
    const meta = PLAN_METADATA[product]?.[result.tier] || {};

    return res.status(200).json({
      ...result,
      label: meta.label || result.tier,
      price: meta.price || 0,
      product,
    });
  } catch (err) {
    console.error('SubscriptionController: Failed to check subscription', err.message);
    return res.status(500).json({ message: 'Unable to check subscription status' });
  }
}

/**
 * POST /api/subscription/activate
 */
async function activateSubscription(req, res) {
  try {
    const userId = req.user?.id;
    const { product, provider, planTier, subscriptionId, currentPeriodEnd } = req.body;

    if (!userId || !product || !provider || !planTier || !subscriptionId || !currentPeriodEnd) {
      return res.status(400).json({ message: 'Missing subscription data' });
    }

    const newSub = new Subscription({
      userId,
      product,
      provider,
      planTier,
      stripeSubscriptionId: provider === 'stripe' ? subscriptionId : null,
      paypalSubscriptionId: provider === 'paypal' ? subscriptionId : null,
      currentPeriodEnd: new Date(currentPeriodEnd),
    });

    await newSub.save();
    return res.status(200).json({ message: 'Subscription activated successfully' });
  } catch (err) {
    console.error('SubscriptionController: Failed to activate subscription', err.message);
    return res.status(500).json({ message: 'Activation failed. Please contact support.' });
  }
}

/**
 * GET /api/subscription/portal?product=kairo|lumo
 */
async function getBillingPortal(req, res) {
  try {
    const userId = req.user?.id;
    const product = req.query.product;

    if (!userId || !product) {
      return res.status(400).json({ message: 'Missing required info for billing portal' });
    }

    const url = await createBillingPortalSession({ userId, product });
    return res.status(200).json({ url });
  } catch (err) {
    console.error('SubscriptionController: Failed to generate billing portal', err.message);
    return res.status(500).json({ message: 'Unable to open billing portal' });
  }
}

module.exports = {
  checkSubscription,
  activateSubscription,
  getBillingPortal,
};
