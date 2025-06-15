// File: /frontend/components/admin/RetrainingToggleCard.jsx
// Purpose: Admin-only component to view and toggle retraining agent activation state

import axios from "axios";
import React, { useEffect, useState } from "react";

/**
 * RetrainingToggleCard.jsx
 *
 * Renders a card that allows admins to view and toggle the state of the AI retraining agent.
 * Connects to backend endpoints:
 * - GET /api/confidence/retrain-status
 * - POST /api/confidence/retrain-toggle
 */

export default function RetrainingToggleCard() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchToggleStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("jwt");
      const res = await axios.get("/api/confidence/retrain-status");
      const data = res.data;
      if (!data.success) throw new Error("Failed to fetch retraining status.");

      setEnabled(data.status === true);
      setError(null);
    } catch (err) {
      console.error("Retraining status error:", err);
      setError("Could not load retraining state.");
    } finally {
      setLoading(false);
    }
  };

  const toggleRetraining = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await axios.post("/api/confidence/retrain-toggle", { enabled: !enabled });
      const data = res.data;
      if (!data.success) throw new Error("Toggle failed.");
      setEnabled(!enabled);
    } catch (err) {
      console.error("Toggle error:", err);
      setError("Unable to update retraining status.");
    }
  };

  useEffect(() => {
    fetchToggleStatus();
  }, []);

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">⚙️ Retraining Agent Toggle</h2>

      {loading ? (
        <p className="text-sm text-gray-500">Checking status...</p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${enabled ? "text-green-600" : "text-red-600"}`}>
              Agent is currently {enabled ? "ENABLED" : "DISABLED"}
            </span>
            <button
              onClick={toggleRetraining}
              className={`px-5 py-2 text-sm font-medium rounded ${
                enabled
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              } transition`}
            >
              {enabled ? "Disable Agent" : "Enable Agent"}
            </button>
          </div>

          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </>
      )}
    </div>
  );
}
