// enhancements/utils/languageUtils.js

/**
 * languageUtils.js
 *
 * Provides localized system messages for fallback UX and CLA-triggered responses.
 * Supports English (en), Spanish (es), Hindi (hi), and Mandarin (zh).
 *
 * Used for server-side response consistency when UI strings need dynamic fallback.
 */

const fs = require('fs');
const path = require('path');

/**
 * Loads and parses the language pack JSON file for the given locale.
 * Defaults to English if file is missing or invalid.
 *
 * @param {string} locale - 'en' | 'es' | 'hi' | 'zh'
 * @returns {object} Dictionary of translation keys
 */
const loadLanguagePack = (locale) => {
  try {
    const supported = ['en', 'es', 'hi', 'zh'];
    const fallback = 'en';

    const lang = supported.includes(locale) ? locale : fallback;
    const langPath = path.join(__dirname, `../../frontend/i18n/locales/${lang}/common.json`);
    const file = fs.readFileSync(langPath, 'utf8');
    return JSON.parse(file);
  } catch (err) {
    console.error(`[LanguageUtils] Failed to load language pack for ${locale}:`, err.message);
    return {};
  }
};

/**
 * Retrieves a localized string from the specified language file.
 *
 * @param {string} locale - Language code (e.g. 'es')
 * @param {string} key - Translation key path (e.g. 'tierLimit.cta')
 * @returns {string|null}
 */
const getLocalizedText = (locale, key) => {
  const languagePack = loadLanguagePack(locale);
  const keys = key.split('.');
  let current = languagePack;

  for (const k of keys) {
    if (typeof current[k] !== 'undefined') {
      current = current[k];
    } else {
      return null;
    }
  }

  return typeof current === 'string' ? current : null;
};

module.exports = {
  getLocalizedText,
};
