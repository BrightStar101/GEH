// File: frontend/middleware/tierAccessClient.js
// Global Entry Hub – Client-side plan tier gate for AI feature access

import { jwtDecode } from "jwt-decode";

/**
 * getUserTierFromJWT
 * Decodes the current JWT token and returns the user's tier.
 * Returns 'free' if token is missing or invalid.
 *
 * @returns {string} - "free" | "starter" | "official" | "family"
 */
export function getUserTierFromJWT() {
  try {
    const token = localStorage.getItem("jwt");
    if (!token) return "free";

    const decoded = jwtDecode(token);
    return decoded?.planTier || "free";
  } catch (err) {
    console.warn("tierAccessClient: failed to decode JWT", err);
    return "free";
  }
}

/**
 * checkTierAccess
 * Checks whether the user has access to a given feature.
 * Returns true if plan is equal to or above the allowed tiers.
 *
 * @param {string[]} allowedTiers - List of tiers that are allowed
 * @returns {boolean}
 */
export function checkTierAccess(allowedTiers = ["starter", "official", "family"]) {
  const tier = getUserTierFromJWT();
  return allowedTiers.includes(tier);
}

/**
 * withTierAccess
 * Optional wrapper component that prevents rendering if user tier is not allowed.
 *
 * @param {React.ReactNode} children
 * @param {string[]} allowedTiers
 * @returns {JSX.Element|null}
 */
export function withTierAccess(children, allowedTiers = ["starter", "official", "family"]) {
  return checkTierAccess(allowedTiers) ? children : null;
}
