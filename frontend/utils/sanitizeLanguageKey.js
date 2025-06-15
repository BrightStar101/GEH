// File: /frontend/utils/sanitizeLanguageKey.js

import languageConfig from "../config/languageConfig";

/**
 * sanitizeLanguageKey.js
 *
 * Normalizes a language input string (e.g., 'es', 'fr-CA') into a valid, supported GEH language code.
 * Fallbacks to the closest available supported language using region-aware and tier-aware matching.
 *
 * @param {string} input - A raw or inferred language code
 * @returns {string} - A valid, supported language code from config
 */
export function sanitizeLanguageKey(input) {
  if (!input || typeof input !== "string") {
    return languageConfig.defaultLanguage;
  }

  const cleaned = input.trim().toLowerCase();

  // Step 1: Try full match (e.g., 'es-mx')
  const exactMatch = languageConfig.supportedLanguages.find(
    (lang) => lang.code.toLowerCase() === cleaned
  );
  if (exactMatch) return exactMatch.code;

  // Step 2: Try region-less match (e.g., 'es' → 'es-ES')
  const languageOnly = cleaned.split("-")[0];
  const partialMatch = languageConfig.supportedLanguages.find(
    (lang) => lang.code.startsWith(languageOnly + "-")
  );
  if (partialMatch) return partialMatch.code;

  // Step 3: Return fallback
  return languageConfig.fallbackLanguage;
}
