/**
 * chatController.js
 *
 * Global Entry Hub (GEH)
 * Mira Chat Controller (Batch 33)
 *
 * Purpose:
 * Accepts and processes chat requests to Mira.
 * Applies moderation filters, input validation, and invokes MiraChatService.
 * All access must be gated through JWT middleware and tier enforcement logic.
 */

const { generateMiraResponse } = require('../services/miraChatService');
const { logChatAttempt } = require('../agents/miraAuditAgent');
// const { getRemainingSessionTime } = require('../services/usageMeterService');
const { validatePrompt } = require('../utils/inputValidator');
const { sanitizeHTML } = require('../utils/richTextSanitizer');
const { logError } = require('../utils/loggerUtils');
const { getUserById } = require('../services/userProfileService');
const TierConfig = require('../config/purchaseTierConfig.json');
const PromptLog = require('../models/PromptLog');

/**
 * POST /api/chat
 * Handles chat request and returns a generated response from Mira.
 * @param {Object} req - Express request object (expects authenticated user)
 * @param {Object} res - Express response object
 */
async function handleChatRequest(req, res) {
  try {
    const userId = req.user?.id;
    const message = req.body?.message?.trim();
    const language = req.body?.language;

    // Validate required fields
    if (!userId || !message) {
      return res.status(400).json({ error: 'Missing user ID or message.' });
    }

    // Validate format
    if (!validatePrompt(message)) {
      return res.status(422).json({ error: 'Invalid message input.' });
    }

    // Optional: sanitize input if using rich text
    const cleanMessage = sanitizeHTML(message);

    // Check session window (should have been set by JWT + tier middleware)
    // const sessionTime = await getRemainingSessionTime(userId);
    // if (sessionTime <= 0) {
    //   return res.status(403).json({ error: 'Mira access expired. Upgrade to continue.' });
    // }

    // Log chat attempt
    await logChatAttempt({
      userId,
      input: cleanMessage,
      timestamp: new Date(),
      tier: req.user?.planTier || 'free',
      type: 'chat_initiated',
    });

    // Invoke Mira service
    const responsePayload = await generateMiraResponse({
      userId,
      message: cleanMessage,
      language
    });

    // Handle service-level errors
    if (responsePayload.error) {
      return res.status(400).json({ error: responsePayload.error });
    }

    let user = await getUserById(userId);
    user.promptsUsed += 1;
    await user.save();

    const maxAllowed = TierConfig[user.planTier].maxPrompts + user.extraPrompts;

    // Return full structured response
    return res.status(200).json({
      message: responsePayload.response,
      language: responsePayload.lang,
      confidence: responsePayload.confidence,
      tier: responsePayload.tier,
      notice: responsePayload.notice,
      supportQuestionUsage: {
        remaining: maxAllowed - user.promptsUsed,
        maxAllowed: maxAllowed,
        percentUsed: Math.min(Math.round((user.promptsUsed / maxAllowed) * 100), 100),
      },
    });
  } catch (err) {
    logError('Error in chatController.handleChatRequest:', err);
    return res.status(500).json({ error: 'Unexpected server error. Please try again later.' });
  }
}

module.exports = {
  handleChatRequest,
};
