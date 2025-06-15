/**
 * allowedAdmins.js
 *
 * Global Entry Hub (GEH)
 * Admin Whitelist Configuration
 *
 * Purpose:
 * Provides a centralized export of authorized admin emails for access control.
 * Used by controller and middleware to enforce restricted access.
 *
 * Security:
 * Do not expose this list to frontend users or store it in a shared state.
 */

const allowedAdmins = [
  'grant@globalentryhub.com',
  'julia@globalentryhub.com',
  'ryan@globalentryhub.com'
];

/**
 * Returns a clean, lowercase-trimmed version of the admin whitelist.
 * Ensures that downstream checks are case-insensitive and error-free.
 * @returns {string[]} sanitized list of admin emails
 */
function getSanitizedAdminList() {
  try {
    return allowedAdmins.map(email => email.trim().toLowerCase());
  } catch (err) {
    console.error('allowedAdmins.js: Failed to sanitize admin list.', err);
    return [];
  }
}

module.exports = getSanitizedAdminList;
