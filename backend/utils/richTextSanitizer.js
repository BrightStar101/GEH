/**
 * richTextSanitizer.js
 *
 * Sanitizes user-submitted rich text for safe rendering in PDFs, previews, and UI
 */

const DOMPurify = require('isomorphic-dompurify');

/**
 * Strips disallowed tags, scripts, and dangerous formatting
 * @param {string} input
 * @returns {string}
 */
function sanitizeHTML(input) {
  if (!input || typeof input !== 'string') return '';
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}

module.exports = {
  sanitizeHTML,
};
