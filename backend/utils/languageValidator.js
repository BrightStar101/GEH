/**
 * languageValidator.js
 *
 * Validates supported language codes for the GEH platform
 * Used by OCR, chat, onboarding, and PDF services
 */

const SUPPORTED_LANGUAGES = [
  'en', 'es', 'hi', 'zh', 'ar', 'fr', 'pt', 'uk', 'tl', // current
  'bn', 'fa', 'ru', 'de', 'id', 'sw', 'vi'              // roadmap
];

/**
 * Checks if a given string is a valid supported language code
 * @param {string} code
 * @returns {boolean}
 */
function isSupportedLanguage(code) {
  return SUPPORTED_LANGUAGES.includes(code);
}

/**
 * Sanitizes the input string, defaulting to 'en' if unknown
 * @param {string} code
 * @returns {string}
 */
function sanitizeLanguageCode(code) {
  if (!code || typeof code !== 'string') return 'en';

  const cleaned = code.toLowerCase().trim();

  return isSupportedLanguage(cleaned) ? cleaned : 'en';
}

/**
 * Exposes the full list for routing, dropdowns, etc.
 */
function getAllSupportedLanguages() {
  return SUPPORTED_LANGUAGES.slice();
}

module.exports = {
  isSupportedLanguage,
  sanitizeLanguageCode,
  getAllSupportedLanguages,
};
