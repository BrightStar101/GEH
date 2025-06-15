const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Subscription = require('models/subscriptionModel');
const fs = require('fs');
const path = require('path');

const RETURN_MAP = {
  kairo: 'https://globalentryhub.com/kairo/dashboard',
  lumo: 'https://globalentryhub.com/lumo/dashboard',
};

function logBillingPortalAccess({ userId, product }) {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] user=${userId} product=${product} opened billing portal\n`;
    const logPath = path.join(__dirname, '../../logs/billing-portal-access.log');
    fs.appendFileSync(logPath, logEntry);
  } catch (err) {
    console.error('BillingPortalService: Failed to log portal access', err.message);
  }
}

async function createBillingPortalSession({ userId, product }) {
  try {
    if (!userId || !product || !['kairo', 'lumo'].includes(product)) {
      throw new Error('Missing or invalid user/product');
    }

    const sub = await Subscription.findOne({
      userId,
      product,
      provider: 'stripe',
      status: { $in: ['active', 'trialing'] },
    })
      .sort({ startedAt: -1 })
      .lean();

    if (!sub || !sub.stripeSubscriptionId) {
      throw new Error('No active Stripe subscription found.');
    }

    const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
    const customerId = stripeSub.customer;

    const returnUrl = RETURN_MAP[product] || 'https://globalentryhub.com/dashboard';

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    logBillingPortalAccess({ userId, product });

    return session.url;
  } catch (err) {
    console.error('BillingPortalService: Failed to create portal session', err.message);
    throw new Error('Unable to open billing portal.');
  }
}

module.exports = {
  createBillingPortalSession,
};
