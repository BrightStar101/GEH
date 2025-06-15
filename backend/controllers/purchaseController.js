/**
 * purchaseController.js
 *
 * Global Entry Hub (GEH)
 * Controller logic for tier-based purchases and validation.
 *
 * Purpose:
 * - Accepts tier purchase requests
 * - Validates pricing, duration, and user eligibility
 * - Coordinates with purchaseService and tierConfig
 * - Enforces retry-safe and tamper-proof monetization logic
 */

const {
  processPurchase,
  fetchUserPurchaseHistory,
  retryFailedTransaction,
  verifyTierAccess,
} = require('../services/purchaseService');

const { logAuditEvent } = require('../utils/purchaseUtils');

/**
 * @function purchaseTier
 * @desc Processes a new purchase for a user-selected tier
 * @param {Object} user - Authenticated user object from JWT
 * @param {Object} purchaseBody - Purchase payload (tierId, paymentToken)
 * @returns {Object} status and tier data
 */
async function purchaseTier(user, purchaseBody) {
  try {
    const result = await processPurchase(user, purchaseBody);
    await logAuditEvent(user.id, 'tier_purchase', {
      tier: purchaseBody.tierId,
      result: result.status,
    });
    return result;
  } catch (err) {
    console.error('[Controller] Purchase Tier Error:', err.message);
    throw new Error('Purchase failed. Please try again or contact support.');
  }
}

/**
 * @function getPurchaseHistory
 * @desc Fetches complete purchase history for user
 * @param {String} userId - Authenticated user ID
 * @returns {Array} array of purchase entries
 */
async function getPurchaseHistory(userId) {
  try {
    return await fetchUserPurchaseHistory(userId);
  } catch (err) {
    console.error('[Controller] Fetch History Error:', err.message);
    throw new Error('Could not retrieve purchase history.');
  }
}

/**
 * @function retryPurchase
 * @desc Attempts to retry a previously failed or interrupted transaction
 * @param {String} userId - Authenticated user ID
 * @param {String} transactionId - Transaction identifier to retry
 * @returns {Object} updated transaction result
 */
async function retryPurchase(userId, transactionId) {
  try {
    const retryResult = await retryFailedTransaction(userId, transactionId);
    await logAuditEvent(userId, 'retry_attempt', {
      transactionId,
      status: retryResult.status,
    });
    return retryResult;
  } catch (err) {
    console.error('[Controller] Retry Failed:', err.message);
    throw new Error('Retry attempt failed. Please contact support.');
  }
}

/**
 * @function validateTierAccess
 * @desc Determines whether the user currently has access to paid AI functionality
 * @param {String} userId - Authenticated user ID
 * @returns {Object} { access: Boolean, tierId, expiry }
 */
async function validateTierAccess(userId) {
  try {
    const result = await verifyTierAccess(userId);
    return {
      access: result.access,
      tierId: result.tierId,
      expiry: result.expiry,
    };
  } catch (err) {
    console.error('[Controller] Tier Access Validation Failed:', err.message);
    throw new Error('Unable to validate tier access at this time.');
  }
}

module.exports = {
  purchaseTier,
  getPurchaseHistory,
  retryPurchase,
  validateTierAccess,
};
