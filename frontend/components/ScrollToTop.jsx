/**
 * ScrollToTop.jsx
 *
 * Global Entry Hub (GEH)
 * Navigation Scroll Reset Utility
 *
 * Purpose:
 * Automatically scrolls to the top of the page on route change.
 * Improves navigation UX, especially in single-page apps with long-scroll content.
 *
 * Usage:
 * Place this component near the top of your router (e.g., in App.jsx).
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.warn("ScrollToTop: scroll failed", err);
    }
  }, [location.pathname]);

  return null;
}
