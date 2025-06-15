/**
 * adminSystemMetricsController.js
 *
 * Global Entry Hub (GEH)
 * Admin Metrics Controller
 *
 * Purpose:
 * Returns high-level usage and monetization metrics across
 * Mira (plan-based), Kairo & Lumo (subscription-based) for
 * internal dashboard reporting.
 */

const PurchaseHistory = require('../models/purchaseHistoryModel');
const Subscription = require('../models/subscriptionModel');

/**
 * GET /admin/dashboard
 */
async function getAdminDashboard(req, res) {
  try {
    const [planData, subs] = await Promise.all([
      PurchaseHistory.find({}),
      Subscription.find({ status: { $in: ['active', 'trialing'] } }),
    ]);

    const miraStats = {
      totalPlans: planData.length,
      starter: planData.filter(p => p.planLevel === 'starter').length,
      official: planData.filter(p => p.planLevel === 'official').length,
      family: planData.filter(p => p.planLevel === 'friends-and-family').length,
    };

    const kairoStats = subs.filter(s => s.product === 'kairo').length;
    const lumoStats = subs.filter(s => s.product === 'lumo').length;

    const result = {
      timestamp: new Date().toISOString(),
      mira: {
        total: miraStats.totalPlans,
        byTier: {
          starter: miraStats.starter,
          official: miraStats.official,
          family: miraStats.family,
        },
      },
      subscriptions: {
        kairoActive: kairoStats,
        lumoActive: lumoStats,
        totalActive: subs.length,
      },
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error('AdminDashboardController Error:', err.message);
    return res.status(500).json({ message: 'Failed to load dashboard metrics' });
  }
}

module.exports = {
  getAdminDashboard,
};
