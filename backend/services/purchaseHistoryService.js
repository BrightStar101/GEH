const PurchaseHistory = require('models/purchaseHistoryModel');

/**
 * Gets the user's most recent active GEH plan.
 */
async function getLatestActivePlan(userId) {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid or missing userId');
    }

    const plan = await PurchaseHistory.findOne({
      userId,
      product: 'GEH',
      isActive: true,
      isArchived: false,
    })
      .sort({ purchasedAt: -1 })
      .lean();

    return plan || null;
  } catch (err) {
    console.error('PurchaseHistoryService: Failed to fetch latest plan', err.message);
    throw new Error('Unable to check plan status.');
  }
}

/**
 * Interprets AI access window and usage limits for the given plan.
 */
function interpretPlanEntitlements(plan) {
  const tiers = {
    free: { forms: 1, pdfs: 0, aiDays: 0 },
    starter: { forms: 2, pdfs: 1, aiDays: 1 },
    official: { forms: 21, pdfs: 20, aiDays: 3 },
    'friends-and-family': { forms: 61, pdfs: 60, aiDays: 7 },
  };

  const config = tiers[plan.planLevel] || tiers.free;
  const now = new Date();

  const aiStatus = {
    active: false,
    expiresIn: null,
    expired: true,
  };

  if (plan.aiAccess?.start && plan.aiAccess?.end) {
    const start = new Date(plan.aiAccess.start);
    const end = new Date(plan.aiAccess.end);
    aiStatus.active = now >= start && now <= end;
    aiStatus.expiresIn = aiStatus.active
      ? Math.round((end - now) / (1000 * 60 * 60 * 24))
      : null;
    aiStatus.expired = now > end;
  }

  return {
    tier: plan.planLevel,
    entitlements: {
      maxForms: config.forms,
      maxPdfs: config.pdfs,
      aiDays: config.aiDays,
    },
    usage: {
      formsUsed: plan.usage?.formsUsed || 0,
      pdfDownloads: plan.usage?.pdfDownloads || 0,
    },
    aiStatus,
    purchasedAt: plan.purchasedAt,
    expiresAt: plan.expiredAt || null,
  };
}

module.exports = {
  getLatestActivePlan,
  interpretPlanEntitlements,
};
