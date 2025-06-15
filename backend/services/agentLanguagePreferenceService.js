/**
 * agentLanguageService.js
 *
 * Manages user language preference across Mira, Kairo, and future agents
 */

const jwt = require('jsonwebtoken');
const { updateUserMetadata, getUserById } = require('../services/userProfileService');
const { logAuditEvent } = require('../services/upgradeLogsService');
const { sanitizeLanguageKey } = require('../utils/sanitizeLanguageKey');
const { logError } = require('../utils/loggerUtils');

/**
 * Sets the preferred language for a user
 * @param {string} token
 * @param {string} languageCode
 * @returns {Promise<{ success: boolean, message: string }>}
 */
async function setLanguagePreference(token, languageCode) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const safeLang = sanitizeLanguageKey(languageCode);

    await updateUserMetadata(userId, {
      'agentPrefs.language': safeLang,
    });

    await logAuditEvent({
      userId,
      type: 'lang_switch',
      source: 'agent',
      value: safeLang,
    });

    return { success: true, message: `Language set to ${safeLang}` };
  } catch (err) {
    logError('agentLanguageService: setLanguagePreference failed', err.message);
    return { success: false, message: 'Unable to set language preference' };
  }
}

/**
 * Gets the active language preference
 * @param {string} token
 * @returns {Promise<string>} language code
 */
async function getLanguagePreference(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserById(decoded.id);

    return (
      user?.metadata?.agentPrefs?.language ||
      user?.preferredLanguage ||
      'en'
    );
  } catch (err) {
    logError('agentLanguageService: getLanguagePreference failed', err.message);
    return 'en';
  }
}

module.exports = {
  setLanguagePreference,
  getLanguagePreference,
};
