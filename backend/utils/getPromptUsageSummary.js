// backend/utils/getPromptUsageSummary.js

/**
 * getPromptUsageSummary.js
 *
 * Utility function to summarize GPT prompt usage per user, form type, and time period
 * for internal auditing, admin views, or usage reporting in the GEH platform.
 *
 * Pulls from the PromptLog collection and returns aggregated metrics including:
 * - Total prompts
 * - Total tokens
 * - Breakdown by purpose (form vs support)
 * - Breakdown by formType
 *
 * Fully compliant with GEH production standards.
 */

const mongoose = require('mongoose');
const PromptLog = require('../models/PromptLog');
const logger = require('../services/loggerService');

/**
 * Retrieves usage summary data from the PromptLog collection.
 *
 * @param {Object} options - Query options
 * @param {string} [options.userId] - Optional user ID to filter by
 * @param {string} [options.formType] - Optional form type to filter by
 * @param {Date} [options.startDate] - Optional start date for filtering logs
 * @param {Date} [options.endDate] - Optional end date for filtering logs
 * @returns {Promise<Object>} Summary object including prompt counts and token totals
 */
async function getPromptUsageSummary(options = {}) {
  try {
    const { userId, formType, startDate, endDate } = options;

    const matchStage = {};

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      matchStage.userId = mongoose.Types.ObjectId(userId);
    }

    if (formType && typeof formType === 'string') {
      matchStage.formType = formType;
    }

    if (startDate || endDate) {
      matchStage.timestamp = {};
      if (startDate instanceof Date) {
        matchStage.timestamp.$gte = startDate;
      }
      if (endDate instanceof Date) {
        matchStage.timestamp.$lte = endDate;
      }
    }

    const summary = await PromptLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            userId: '$userId',
            formType: '$formType',
            purpose: '$purpose',
          },
          totalPrompts: { $sum: 1 },
          totalTokens: { $sum: '$tokenCount' },
        },
      },
      {
        $group: {
          _id: {
            userId: '$_id.userId',
          },
          forms: {
            $push: {
              formType: '$_id.formType',
              purpose: '$_id.purpose',
              prompts: '$totalPrompts',
              tokens: '$totalTokens',
            },
          },
          totalPrompts: { $sum: '$totalPrompts' },
          totalTokens: { $sum: '$totalTokens' },
        },
      },
    ]);

    return summary[0] || {
      totalPrompts: 0,
      totalTokens: 0,
      forms: [],
    };
  } catch (err) {
    logger.logError('Error in getPromptUsageSummary:', err.message);
    return {
      error: 'Failed to retrieve prompt usage summary',
      totalPrompts: 0,
      totalTokens: 0,
      forms: [],
    };
  }
}

module.exports = {
  getPromptUsageSummary,
};
