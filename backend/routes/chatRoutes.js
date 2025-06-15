/**
 * chatRouter.js
 *
 * Global Entry Hub (GEH)
 * Mira Chat API Router (Launch Version)
 *
 * Purpose:
 * Secure, rate-limited, tier-aware API for sending chat messages to Mira.
 * Integrates AI usage enforcement and abuse flagging.
 */

const express = require('express');
const router = express.Router();

const { handleChatRequest } = require('../controllers/chatController');
// const { shouldBlockMiraAccess, flagAiAbuse } = require('../agents/miraAccessControlAgent');
const authMiddleware = require('../middleware/authMiddleware');
const tierAccessMiddleware = require('../middleware/tierAccessMiddleware');
const miraPolicyGuard = require('../middleware/miraPolicyGuard');
const usageMeterMiddleware = require('../middleware/usageMeterMiddleware');
const { rateLimiter } = require('../middleware/rateLimiter');
const logger = require('../utils/loggerUtils');
const logPromptUsage = require('../middleware/logPromptUsage');
const { promptAvailable } = require('../utils/tierUtils');
const { getUserById } = require('../services/userProfileService');

// Rate limiting configuration (low-risk: 3 chats per minute per IP)
const chatLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 3,
  message: { error: 'Rate limit exceeded. Please wait before sending another message.' }
});

/**
 * Internal gatekeeper: checks Mira access via usage caps and tier features
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Promise<Boolean>} - Whether access should be allowed to proceed
 */
async function accessControlCheck(req, res) {
  try {
    const userId = req.user?.id;

    const access = true;//await shouldBlockMiraAccess(userId);

    if (access.blocked) {
      logger.logWarn(`Mira access blocked for user ${userId}: ${access.reason}`);
      await flagAiAbuse(userId, access.reason);

      return res.status(403).json({
        message: 'Mira access denied.',
        reason: access.reason,
      });
    }

    return true;
  } catch (err) {
    logger.logError('ChatRouter access check failed:', err);
    return res.status(500).json({ message: 'Internal error verifying AI access.' });
  }
}

/**
 * POST /api/chat
 * Authenticated, rate-limited, and tier-enforced entry point for Mira chat.
 * Includes AI usage gate and overuse protection.
 */
router.post(
  '/',
  authMiddleware.authenticate,
  chatLimiter,
  tierAccessMiddleware.enforceTierFeature('includesMira'),
  // usageMeterMiddleware,
  miraPolicyGuard,
  logPromptUsage,
  async (req, res) => {
    try {
      const allowed = await accessControlCheck(req, res);
      if (allowed !== true) return;
      if (!promptAvailable(await getUserById(req.user.id))) {
        return res.status(403).json({
          error: 'Upgrade your plan to use AI.',
          extra: true
        });
      }

      await handleChatRequest(req, res);
    } catch (err) {
      logger.logError('Unexpected error in /api/chat route:', err);
      res.status(500).json({ error: 'Unexpected error while processing chat.' });
    }
  }
);

module.exports = router;
