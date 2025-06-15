// File: /frontend/hooks/useUserTier.js
// Purpose: Returns user plan tier ("free", "starter", "official", "family") based on JWT token

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

/**
 * useUserTier
 *
 * A reusable React hook that extracts the user's current plan tier
 * from their JWT stored in localStorage.
 * Falls back to "free" if token is invalid or missing.
 *
 * @returns {string} planTier - One of: "free", "starter", "official", "family"
 */
export default function useUserTier() {
  const [planTier, setPlanTier] = useState("free");

  useEffect(() => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        setPlanTier("free");
        return;
      }

      const decoded = jwtDecode(token);
      const tier = decoded?.planTier || "free";

      if (["starter", "official", "family"].includes(tier)) {
        setPlanTier(tier);
      } else {
        setPlanTier("free");
      }
    } catch (err) {
      console.error("useUserTier: Failed to decode JWT", err);
      setPlanTier("free");
    }
  }, []);

  return { tierId: planTier };
}
