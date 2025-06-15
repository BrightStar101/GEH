// backend/middleware/logPromptUsage.js

/**
 * logPromptUsage.js
 *
 * Middleware for logging GPT prompt usage per user for token enforcement,
 * per-form analysis, and tier-based support gating in Global Entry Hub (GEH).
 *
 * Logs details like:
 * - Prompt content and length
 * - GPT model used
 * - Prompt purpose (support or form)
 * - Associated form type
 * - Tokens used
 * - User tier at time of prompt
 * 
 * Also attaches real-time support question usage to the response if requested.
 */

const PromptLog = require('../models/PromptLog');
const { getUserById } = require('../services/userProfileService');
const { getRemainingQuestions } = require('../utils/getRemainingQuestions');
const logger = require('../utils/loggerUtils');

/**
 * Middleware to log GPT usage and support question tracking.
 * Expects req.user, req.body.prompt, req.body.formType, and req.body.purpose
 *
 * @param {Object} req - Express request object with user and body
 * @param {Object} res - Express response object (augmented with question usage info)
 * @param {Function} next - Express next middleware function
 */
const logPromptUsage = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      throw new Error('User not authenticated in logPromptUsage');
    }

    const { message, formType = 'string', purpose = 'support', gptModelUsed = 'gpt-4o' } = req.body;

    if (!message || typeof message !== 'string') {
      throw new Error('Missing or invalid prompt in request body');
    }

    if (!formType || typeof formType !== 'string') {
      throw new Error('Missing or invalid formType in request body');
    }

    if (!['support', 'form'].includes(purpose)) {
      throw new Error('Invalid prompt purpose (must be support or form)');
    }

    const tokenCount = Math.ceil(message.length / 4); // Approximate conversion: 1 token ≈ 4 chars

    const user = await getUserById(req.user.id);
    const tierKey = user.planTier || 'free';

    const promptEntry = await PromptLog.create({
      userId: req.user.id,
      formType: formType.trim(),
      purpose,
      promptContent: message.trim().slice(0, 10000),
      tokenCount,
      gptModel: gptModelUsed,
      userTierAtTime: tierKey,
    });

    await promptEntry.save();

    // Optionally calculate and attach support question count
    if (purpose === 'support') {
      const usageStats = await getRemainingQuestions(req.user.id, tierKey);
      res.locals.supportQuestionUsage = usageStats;
    }

    return next();
  } catch (err) {
    logger.logError('Error in logPromptUsage middleware:', err.message);
    return next(); // never block the user even if logging fails
  }
};

module.exports = logPromptUsage;
