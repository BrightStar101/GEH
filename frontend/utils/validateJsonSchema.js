// File: /frontend/utils/validateJsonSchema.js

/**
 * validateJsonSchema.js
 *
 * Runtime validator for dynamic translation file content.
 * Prevents malformed i18n files from crashing the frontend.
 * Uses lightweight schema checks (no external libraries).
 */

/**
 * A sample list of required keys.
 * This should be expanded based on all common phrases in GEH i18n files.
 */
const requiredTopLevelKeys = ["welcome", "dashboard", "support", "legal", "ai", "error"];

/**
 * Validates that the given translation object:
 * - Is a flat or nested object
 * - Contains at least the expected top-level sections
 * - Contains only strings (or nested string objects)
 *
 * @param {object} json - The parsed translation file object
 * @returns {boolean}
 */
export function validateTranslationSchema(json) {
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    console.warn("Invalid translation structure: not an object.");
    return false;
  }

  const topKeys = Object.keys(json);

  const hasRequiredKeys = requiredTopLevelKeys.every((key) => topKeys.includes(key));
  if (!hasRequiredKeys) {
    console.warn("Translation schema missing one or more required keys.");
    return false;
  }

  const isValidContent = validateContentRecursive(json);
  if (!isValidContent) {
    console.warn("Translation schema contains invalid types (non-string or nested arrays).");
  }

  return hasRequiredKeys && isValidContent;
}

/**
 * Recursively checks that all values are strings or objects of strings.
 *
 * @param {object} obj
 * @returns {boolean}
 */
function validateContentRecursive(obj) {
  return Object.values(obj).every((val) => {
    if (typeof val === "string") return true;
    if (typeof val === "object" && !Array.isArray(val)) {
      return validateContentRecursive(val);
    }
    return false;
  });
}
