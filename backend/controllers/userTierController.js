/**
 * userTierController.js
 *
 * Global Entry Hub (GEH)
 * Tier access controller for frontend and agent queries
 */

const User = require('../models/userModel');
const { mapTierToFeatures } = require('../utils/purchaseUtils');
const logger = require('../utils/loggerUtils');

/**
 * @function getUserTier
 * @desc Returns tier metadata for the authenticated user
 */
async function getUserTier(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || !user.planTier) {
      return res.status(404).json({ message: 'User tier not found.' });
    }

    const tierMeta = mapTierToFeatures(user.planTier);
    if (!tierMeta) {
      return res.status(403).json({ message: 'Invalid or unsupported tier.' });
    }

    res.status(200).json({
      planTier: user.planTier,
      planActivatedAt: user.planActivatedAt || null,
      formUsed: user.formUsed,
      promptsUsed: user.promptsUsed,
      extraPrompts: user.extraPrompts,
      features: {
        ...tierMeta
      }
    });
  } catch (err) {
    logger.logError('UserTierController: getUserTier error', err);
    res.status(500).json({ message: 'Failed to retrieve tier status.' });
  }
}

module.exports = {
  getUserTier
};
