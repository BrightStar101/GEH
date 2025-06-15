/**
 * languageControl.js
 *
 * Route: /api/agent/language-control/:agent
 * Purpose: Returns language matrix per agent and tier for frontend gating
 * Access: Public
 */

const express = require('express');
const { getAgentLanguagesByTier } = require('../../../services/agentLanguageService');
const { sanitizeInput } = require('../../../utils/sanitizeInput');
const { logger } = require('../../../utils/loggerUtils');

const router = express.Router();

/**
 * @route GET /api/agent/language-control/:agent
 * @desc Returns available languages for a given agent by tier
 * @query ?tier=verified|beta|comingSoon
 */
router.get('/:agent', async (req, res) => {
  try {
    const agent = sanitizeInput(req.params.agent);
    const tier = sanitizeInput(req.query.tier);

    if (!agent) {
      return res.status(400).json({ success: false, message: 'Missing agent identifier.' });
    }

    const languages = getAgentLanguagesByTier(agent, tier || null);

    return res.status(200).json({
      success: true,
      agent,
      tier: tier || 'all',
      count: languages.length,
      languages,
    });
  } catch (err) {
    logger.logError('languageControl.js GET failed:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load agent language matrix.',
    });
  }
});

module.exports = router;
