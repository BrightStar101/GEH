// utils/firstFormTracker.js

const { ForbiddenError } = require('./errorUtils');
const logger = require('../services/loggerService');
const User = require('../models/userModel');

/**
 * Checks whether the user has already used their free form.
 * Includes expiry enforcement (90 days) and CLA triggers.
 *
 * @param {string} userId - Authenticated user's ID
 * @returns {Promise<boolean>}
 */
async function hasUsedFreeForm(userId) {
  try {
    if (!userId) throw new Error('Missing user ID for free form check');

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // If free form was never used, allow
    if (!user.freeFormUsedAt) return false;

    const usedAt = new Date(user.freeFormUsedAt);
    const now = new Date();
    const diffDays = Math.floor((now - usedAt) / (1000 * 60 * 60 * 24));

    // If 90 days expired, reset eligibility
    if (diffDays > 90) {
      user.freeFormUsedAt = null;
      await user.save();
      return false;
    }

    // If used and not expired
    return true;
  } catch (err) {
    logger.error({
      action: 'free_form_check_failed',
      userId,
      error: err.message,
    });

    // Fallback to safe mode: block access
    return true;
  }
}

/**
 * Middleware to enforce 1-time use of free form.
 * If user has a paid plan, bypass restriction.
 */
function enforceFreeFormLimit() {
  return async function (req, res, next) {
    try {
      const user = req.user;

      const hasPlan = user?.planTier && user?.planTier !== 'free';

      // If paid plan, always allow
      if (hasPlan) return next();

      const alreadyUsed = await hasUsedFreeForm(user._id);

      if (alreadyUsed) {
        logger.warn({
          action: 'free_form_blocked',
          userId: user._id,
          reason: 'Already used free form in last 90 days',
        });

        logger.triggerCLA({
          event: 'free_form_denied',
          userId: user._id,
          reason: 'free-tier exhausted',
        });

        throw new ForbiddenError('You’ve already used your free form. Please upgrade your plan to continue.');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Logs the moment a user consumes their free form slot.
 *
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function recordFreeFormUsed(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.freeFormUsedAt = new Date();
    await user.save();

    logger.success({
      action: 'free_form_logged',
      userId,
      timestamp: user.freeFormUsedAt,
    });
  } catch (err) {
    logger.error({
      action: 'free_form_log_failed',
      userId,
      error: err.message,
    });
  }
}

module.exports = {
  hasUsedFreeForm,
  enforceFreeFormLimit,
  recordFreeFormUsed,
};
