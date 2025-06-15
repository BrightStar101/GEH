/**
 * adminSubscriptionController.js
 *
 * Global Entry Hub (GEH)
 * Admin Override Controller for Kairo/Lumo Subscriptions
 *
 * Purpose:
 * Enables authorized admins to manually override Kairo/Lumo subscription
 * fields such as status, end date, or override flags.
 */

const { overrideSubscriptionField } = require('../services/overrideService');

/**
 * POST /admin/override/subscription
 */
async function overrideSubscriptionStatus(req, res) {
  try {
    const adminId = req.user?.id;
    const { userId, product, field, newValue, reason } = req.body;

    if (!userId || !product || !field || typeof newValue === 'undefined') {
      return res.status(400).json({ message: 'Missing override input parameters.' });
    }

    if (!['kairo', 'lumo'].includes(product)) {
      return res.status(400).json({ message: 'Invalid subscription product.' });
    }

    const result = await overrideSubscriptionField({
      userId,
      field,
      newValue,
      reason,
      adminId,
      product,
    });

    return res.status(200).json({
      message: 'Subscription override successful.',
      details: result,
    });
  } catch (err) {
    console.error('AdminSubscriptionController Error:', err.message);
    return res.status(500).json({ message: 'Failed to override subscription.' });
  }
}

module.exports = {
  overrideSubscriptionStatus,
};
