// File: /frontend/utils/analyticsTracker.js
// Purpose: Production-grade event logging wrapper for GA4 or Mixpanel

/**
 * analyticsTracker.js
 *
 * Handles unified tracking of page views and click events.
 * Supports automatic routing to GA4 or Mixpanel based on configuration.
 * Ensures compliance-safe logging with runtime validation.
 */

const ANALYTICS_MODE = import.meta.env.REACT_APP_ANALYTICS_MODE || "GA"; // GA or MIXPANEL
const GA_TRACKING_ID = import.meta.env.REACT_APP_GA_TRACKING_ID;
const MIXPANEL_TOKEN = import.meta.env.REACT_APP_MIXPANEL_TOKEN;

let mixpanelInitialized = false;

/**
 * Initializes Mixpanel if selected
 */
function initializeMixpanel() {
  try {
    if (ANALYTICS_MODE === "MIXPANEL" && typeof window.mixpanel !== "undefined") {
      if (!mixpanelInitialized) {
        window.mixpanel.init(MIXPANEL_TOKEN);
        mixpanelInitialized = true;
      }
    }
  } catch (err) {
    console.error("Mixpanel initialization failed:", err);
  }
}

/**
 * Logs a page view using the configured analytics service
 * @param {string} pageName - Route or slug being viewed
 */
function logPageView(pageName = "unknown_page") {
  try {
    if (ANALYTICS_MODE === "GA" && typeof window.gtag === "function" && GA_TRACKING_ID) {
      window.gtag("event", "page_view", {
        page_title: pageName,
        page_location: window.location.href,
      });
    } else if (ANALYTICS_MODE === "MIXPANEL") {
      initializeMixpanel();
      window.mixpanel.track("Page View", {
        page: pageName,
        url: window.location.href,
      });
    } else {
      console.warn("Analytics service not available or improperly configured.");
    }
  } catch (err) {
    console.error("Error logging page view:", err);
  }
}

/**
 * Logs a custom event for analytics
 * @param {string} eventName - Label of event (e.g. 'cta_click')
 * @param {object} eventData - Optional payload of metadata (e.g. tier, source)
 */
function logEvent(eventName = "undefined_event", eventData = {}) {
  try {
    if (ANALYTICS_MODE === "GA" && typeof window.gtag === "function") {
      window.gtag("event", eventName, eventData);
    } else if (ANALYTICS_MODE === "MIXPANEL") {
      initializeMixpanel();
      window.mixpanel.track(eventName, eventData);
    } else {
      console.warn("Analytics event not logged — missing tracker or config.");
    }
  } catch (err) {
    console.error("Error logging custom event:", err);
  }
}

export default {
  logPageView,
  logEvent,
};
