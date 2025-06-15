const Subscription = require('../models/subscriptionModel');
const userModel = require('../models/userModel');
const purchaseTiers = require('../config/purchaseTierConfig.json');

/**
 * Checks if a user's subscription is currently valid for a specific product.
 *
 * @param {Object} options
 * @param {string} options.userId - Authenticated user's ID
 * @param {string} options.product - 'kairo' or 'lumo'
 * @returns {Promise<{
 *   active: boolean,
 *   tier?: string,
 *   expiresAt?: Date,
 *   isCanceled?: boolean,
 *   adminOverride?: boolean,
 *   status?: string
 * }>}
 */
async function getSubscriptionStatus({ userId, product }) {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid or missing user ID');
    }

    if (!['kairo', 'lumo'].includes(product)) {
      throw new Error('Invalid subscription product');
    }

    const record = await Subscription.findOne({
      userId,
      product,
    })
      .sort({ startedAt: -1 })
      .lean();

    if (!record) {
      return { active: false, status: 'none' };
    }

    const now = new Date();
    const isExpired = record.currentPeriodEnd && now > new Date(record.currentPeriodEnd);
    const isCanceled = record.status === 'canceled';

    const active =
      record.adminOverride ||
      (!isExpired && !isCanceled && record.status === 'active');

    return {
      active,
      tier: record.planTier,
      expiresAt: record.currentPeriodEnd,
      isCanceled,
      adminOverride: record.adminOverride || false,
      status: record.status,
    };
  } catch (err) {
    console.error('SubscriptionService: Failed to verify subscription', err.message);
    return {
      active: false,
      status: 'error',
    };
  }
}

async function getUserTierById(userId) {
  try {
    const user = await userModel.findById(userId);
    return user.planTier;
  } catch (err) {
    console.error('SubscriptionService: Failed to get user tier by id', err.message);
    return {
      active: false,
      status: 'error',
    };
  }
}

async function getUserPlanStatusById(userId) {
  try {
    const user = await userModel.findById(userId);
    return purchaseTiers[user.planTier];
  } catch (err) {
    console.error('SubscriptionService: Failed to get user tier by id', err.message);
    return {
      active: false,
      status: 'error',
    };
  }
}

module.exports = {
  getSubscriptionStatus,
  getUserTierById,
  getUserPlanStatusById
};
