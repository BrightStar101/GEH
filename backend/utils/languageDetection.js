/**
 * languageDetection.js
 * Provides normalization and validation logic for language codes.
 */

const SUPPORTED_LANG_CODES = [
  "en-US", "es-ES", "hi-IN", "zh-CN", "ar", "fr", "pt", "tl", "uk"
];

const DEFAULT_LANGUAGE = "en-US";

function normalizeLanguageCode(code) {
  if (!code || typeof code !== "string") {
    return { normalized: DEFAULT_LANGUAGE, fallbackUsed: true };
  }

  const trimmed = code.trim().toLowerCase();

  const normalized = SUPPORTED_LANG_CODES.find(
    (lang) => lang.toLowerCase() === trimmed
  );

  return {
    normalized: normalized || DEFAULT_LANGUAGE,
    fallbackUsed: !normalized,
  };
}

function isLanguageSupported(code) {
  return SUPPORTED_LANG_CODES.includes(code);
}

module.exports = {
  normalizeLanguageCode,
  isLanguageSupported,
};
