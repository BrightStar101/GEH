const { v4: uuidv4 } = require('uuid');
const { getUserById, updateUserTier } = require('../services/userProfileService');
const {
  logPurchaseTransaction,
  getPurchaseLogsByUser,
  getTransactionById,
} = require('../models/purchaseModel');
const tierConfig = require('../config/purchaseTierConfig.json');
const dayjs = require('dayjs');

async function processPurchase(user, purchaseData) {
  try {
    const { tierId, paymentToken } = purchaseData;

    if (!tierId || !tierConfig[tierId]) {
      throw new Error('Invalid or unsupported tier selected.');
    }

    const selectedTier = tierConfig[tierId];
    const currentTime = dayjs();
    const expiryTime = currentTime.add(selectedTier.durationHours, 'hour').toISOString();
    const transactionId = uuidv4();

    const logEntry = {
      transactionId,
      userId: user.id,
      tierId,
      amount: selectedTier.price,
      method: paymentToken ? 'token' : 'free',
      status: 'completed',
      expiresAt: expiryTime,
      createdAt: currentTime.toISOString(),
    };

    await logPurchaseTransaction(logEntry);
    await updateUserTier(user.id, { tierId, expiresAt: expiryTime });

    return { status: 'success', tierId, expiresAt: expiryTime };
  } catch (err) {
    console.error('[Service] Purchase Processing Error:', err.message);
    throw new Error('Unable to process your purchase at this time.');
  }
}
async function fetchUserPurchaseHistory(userId) {
  try {
    const logs = await getPurchaseLogsByUser(userId);
    return logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    console.error('[Service] Fetch History Error:', err.message);
    throw new Error('Could not retrieve history.');
  }
}

async function retryFailedTransaction(userId, transactionId) {
  try {
    if (!transactionId) throw new Error('Transaction ID required.');
    const previous = await getTransactionById(transactionId);

    if (!previous || previous.userId !== userId) {
      throw new Error('Unauthorized retry attempt.');
    }

    if (previous.status === 'completed') {
      return { status: 'already_completed', tierId: previous.tierId };
    }

    const retryId = uuidv4();
    const currentTime = dayjs();
    const tierMeta = tierConfig[previous.tierId];
    const newExpiry = currentTime.add(tierMeta.durationHours, 'hour').toISOString();

    const retryEntry = {
      transactionId: retryId,
      userId,
      tierId: previous.tierId,
      amount: tierMeta.price,
      method: previous.method,
      status: 'completed',
      expiresAt: newExpiry,
      createdAt: currentTime.toISOString(),
      retriedFrom: transactionId,
    };

    await logPurchaseTransaction(retryEntry);
    await updateUserTier(userId, { tierId: previous.tierId, expiresAt: newExpiry });

    return { status: 'retried_successfully', tierId: previous.tierId, expiresAt: newExpiry };
  } catch (err) {
    console.error('[Service] Retry Transaction Error:', err.message);
    throw new Error('Retry operation failed.');
  }
}

module.exports = {
  processPurchase,
  fetchUserPurchaseHistory,
  retryFailedTransaction,
};
