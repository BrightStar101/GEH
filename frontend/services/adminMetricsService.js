// File: /frontend/services/adminMetricsService.js
// Purpose: Retrieves internal usage metrics for /admin-impact dashboard view

import axios from "axios";

/**
 * getAdminImpactMetrics
 *
 * Authenticated fetch for admin impact metrics.
 * Requires valid JWT in Authorization header.
 *
 * @param {string} jwt - JWT token for admin session
 * @returns {Promise<object>} Parsed JSON response from backend or error object
 */

export async function getAdminImpactMetrics(jwt) {
  try {
    const response = await axios.get("/api/admin/metrics");
    const data = response.data;
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error("getAdminImpactMetrics error:", err);
    return {
      success: false,
      data: null,
      error: err.message,
    };
  }
}
