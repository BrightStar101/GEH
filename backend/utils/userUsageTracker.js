// enhancements/utils/userUsageTracker.js

/**
 * userUsageTracker.js
 *
 * Utility to fetch total token and prompt usage by user ID.
 * Used to enforce monetization caps for different subscription tiers.
 */

const PromptLog = require('../models/PromptLog');
const logger = require('../services/loggerService');

/**
 * Calculates total tokens and prompt count for the given user.
 *
 * @param {string} userId - MongoDB user ID
 * @returns {Promise<{ tokensUsed: number, promptsUsed: number }>}
 */
const getUserPromptUsage = async (userId) => {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId provided to getUserPromptUsage');
    }

    const usageData = await PromptLog.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalTokens: { $sum: '$tokenCount' },
          promptCount: { $sum: 1 },
        },
      },
    ]);

    const result = usageData[0] || { totalTokens: 0, promptCount: 0 };

    return {
      tokensUsed: result.totalTokens,
      promptsUsed: result.promptCount,
    };
  } catch (err) {
    logger.error(`Error in getUserPromptUsage for user ${userId}: ${err.message}`);
    // Fallback-safe return for continued access if needed
    return {
      tokensUsed: 0,
      promptsUsed: 0,
    };
  }
};

module.exports = {
  getUserPromptUsage,
};
