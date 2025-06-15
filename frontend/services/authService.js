// File: /frontend/services/authService.js

/**
 * logoutUser
 * Clears all client-side auth/session data and redirects user to login screen.
 */
export function logoutUser() {
  try {
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    window.location.href = "/login";
  } catch (err) {
    console.error("logoutUser failed:", err);
  }
}

/**
 * getToken
 * Retrieves the current JWT token from localStorage (read-only).
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem("authToken");
}

/**
 * isAuthenticated
 * Returns boolean based on presence of token.
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getToken();
}
