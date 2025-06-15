const agentLanguageMatrix = require('config/agentLanguageMatrix');
const { logger } = require('utils/loggerUtils');

function getAgentLanguageTier(agentName, langCode) {
  try {
    if (!agentName || !langCode) {
      throw new Error("Missing agentName or langCode");
    }
    return agentLanguageMatrix.getTier(agentName, langCode);
  } catch (err) {
    logger.logError("getAgentLanguageTier failed:", err);
    return null;
  }
}

function isAgentLanguageSupported(agentName, langCode) {
  try {
    const allowed = agentLanguageMatrix.isSupported(agentName, langCode);
    if (!allowed) {
      logger.logWarn(`[AGENT-BLOCKED] ${agentName} → ${langCode} blocked (unsupported or disabled)`);
    }
    return allowed;
  } catch (err) {
    logger.logError("isAgentLanguageSupported failed:", err);
    return false;
  }
}

function getAgentLanguagesByTier(agentName, tier = null) {
  try {
    return agentLanguageMatrix.getLanguages(agentName, tier);
  } catch (err) {
    logger.logError("getAgentLanguagesByTier failed:", err);
    return [];
  }
}

module.exports = {
  getAgentLanguageTier,
  isAgentLanguageSupported,
  getAgentLanguagesByTier,
};
