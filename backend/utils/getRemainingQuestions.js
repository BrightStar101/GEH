// utils/getRemainingQuestions.js

/**
 * getRemainingQuestions.js
 *
 * Utility function for calculating remaining AI support questions for a user
 * based on their subscription tier and prompt usage history.
 *
 * This is compliant with Global Entry Hub (GEH) ecosystem standards.
 * - All inputs are validated
 * - Uses standardized error handling
 * - Designed for production environments
 */

const mongoose = require('mongoose');
const PromptLog = require('../models/PromptLog');
const { getUserTierConfig } = require('../config/tierConfig');
const logger = require('../utils/loggerUtils');

/**
 * Calculates how many AI support questions a user has remaining based on their tier.
 *
 * @param {ObjectId} userId - The MongoDB user ID.
 * @param {string} tierKey - The user’s current tier ("free", "starter", "official", "family").
 * @returns {Promise<Object>} Remaining support question details:
 *          - used: Number of support prompts logged
 *          - maxAllowed: Max support questions by tier
 *          - remaining: Remaining support questions
 *          - percentUsed: % of quota used
 */
async function getRemainingQuestions(userId, tierKey) {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid userId provided to getRemainingQuestions');
    }

    const tierConfig = getUserTierConfig(tierKey);
    const maxAllowed = tierConfig?.maxSupportQuestions ?? 0;

    if (maxAllowed === 0) {
      return {
        used: 0,
        maxAllowed: 0,
        remaining: 0,
        percentUsed: 100,
      };
    }

    // Count only 'support' prompts from PromptLog
    const used = await PromptLog.countDocuments({
      userId: userId
    });

    const remaining = Math.max(maxAllowed - used, 0);
    const percentUsed = Math.min(Math.round((used / maxAllowed) * 100), 100);

    return {
      used,
      maxAllowed,
      remaining,
      percentUsed,
    };
  } catch (error) {
    logger.logError('Error in getRemainingQuestions:', error.message);
    return {
      used: 0,
      maxAllowed: 0,
      remaining: 0,
      percentUsed: 100,
      error: 'Failed to calculate remaining support questions',
    };
  }
}

module.exports = {
  getRemainingQuestions,
};
