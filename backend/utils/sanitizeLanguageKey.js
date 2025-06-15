const languageConfig = require("../config/languageConfig");

function sanitizeLanguageKey(input) {
  if (!input || typeof input !== "string") {
    return languageConfig.defaultLanguage;
  }

  const cleaned = input.trim().toLowerCase();

  const exactMatch = languageConfig.supportedLanguages.find(
    (lang) => lang.code.toLowerCase() === cleaned
  );
  if (exactMatch) return exactMatch.code;

  const languageOnly = cleaned.split("-")[0];
  const partialMatch = languageConfig.supportedLanguages.find(
    (lang) => lang.code.startsWith(languageOnly + "-")
  );
  if (partialMatch) return partialMatch.code;

  return languageConfig.fallbackLanguage;
}

module.exports = {
  sanitizeLanguageKey,
};
