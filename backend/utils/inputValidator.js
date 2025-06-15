/**
 * inputValidator.js
 * Sanitizes and validates inbound text or structured input.
 */

const MAX_INPUT_LENGTH = 5000;
const UNSUPPORTED_LANGUAGES = ["xx-XX"];
const FORBIDDEN_PATTERNS = [/select\s+\*\s+from/i, /<script>/i, /\bDROP TABLE\b/i];

function validatePrompt(prompt) {
  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return { valid: false, message: "Input must be a non-empty string." };
  }

  if (prompt.length > MAX_INPUT_LENGTH) {
    return {
      valid: false,
      message: `Prompt exceeds max allowed length of ${MAX_INPUT_LENGTH} characters.`,
    };
  }

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(prompt)) {
      return { valid: false, message: "Input contains potentially dangerous content." };
    }
  }

  return { valid: true };
}

function validateLanguageCode(langCode) {
  if (!langCode || typeof langCode !== "string") {
    return { valid: false, message: "Language code must be a valid string." };
  }

  if (UNSUPPORTED_LANGUAGES.includes(langCode)) {
    return { valid: false, message: `Language code ${langCode} is not supported at this time.` };
  }

  // return { va:contentReference[oaicite:0]{index=0}
}

module.exports = {
  validatePrompt,
  validateLanguageCode
}