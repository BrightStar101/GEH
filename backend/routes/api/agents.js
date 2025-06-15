/**
 * @route /api/agent
 * @desc Handles GET and POST routes for setting and retrieving active agents
 * @access Protected (JWT required)
 */

const express = require('express');
const { getActiveAgent, setActiveAgent } = require('../../services/agentContextService');
const { validateAgentName } = require('../../utils/validators');
const { logger } = require('../../utils/logger');
const { rateLimiter } = require('../../middleware/rateLimiter');
const { verifyJWT } = require('../../middleware/authMiddleware');

const router = express.Router();

/**
 * @route GET /api/agent/active
 * @desc Retrieves the currently active agent for the authenticated user
 * @access Private (JWT required)
 */
router.get('/active', verifyJWT, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { activeAgent } = await getActiveAgent(token);
    return res.status(200).json({ success: true, activeAgent });
  } catch (err) {
    logger.logError(`GET /api/agent/active failed: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Unable to fetch active agent' });
  }
});

/**
 * @route POST /api/agent/set
 * @desc Updates the active agent for the authenticated user
 * @access Private (JWT required)
 * @body { "newAgent": "Kairo" }
 */
router.post('/set', verifyJWT, rateLimiter({ windowMs: 60000, max: 5 }), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { newAgent } = req.body;

    if (!newAgent || !validateAgentName(newAgent)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing agent name' });
    }

    const result = await setActiveAgent(token, newAgent);
    return res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    logger.logError(`POST /api/agent/set failed: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Unable to set active agent' });
  }
});

module.exports = router;
