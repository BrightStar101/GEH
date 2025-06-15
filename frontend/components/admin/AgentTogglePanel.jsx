// File: /frontend/components/admin/AgentTogglePanel.jsx
// Purpose: Allows admin to toggle feature flags for AI agents (e.g., retraining, scoring)

import React from "react";
import PropTypes from "prop-types";
import axios from "axios";

/**
 * AgentTogglePanel.jsx
 *
 * Displays a list of AI agent toggle switches with labels, descriptions,
 * and last-modified metadata. Sends toggle changes to backend with auth.
 */

export default function AgentTogglePanel({ toggles }) {
  const token = localStorage.getItem("jwt");

  const handleToggle = async (key, newState) => {
    try {
      const res = await axios.post(`/api/admin/agents/toggles/${key}`, { enabled: newState });
      const result = res.data;
      if (!result.success) {
        console.error("Toggle update failed:", result.message);
        alert(`Failed to update toggle: ${result.message}`);
      }
    } catch (err) {
      console.error("Toggle update error:", err);
      alert("Server error while updating toggle.");
    }
  };

  if (!Array.isArray(toggles) || toggles.length === 0) {
    return <p className="text-sm text-gray-500">No toggles found.</p>;
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">AI Agent Controls</h2>
      <ul className="space-y-5">
        {toggles.map((toggle) => (
          <li key={toggle.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-md border">
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{toggle.label}</p>
              <p className="text-sm text-gray-600">{toggle.description}</p>
              <p className="text-xs text-gray-400">
                Last updated: {new Date(toggle.lastUpdated).toLocaleString()}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={toggle.enabled}
                  onChange={(e) => handleToggle(toggle.key, e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-5 rounded-full transition ${toggle.enabled ? "bg-blue-600" : "bg-gray-300"}`}>
                  <div className={`h-5 w-5 bg-white rounded-full shadow transform transition ${toggle.enabled ? "translate-x-5" : ""}`}></div>
                </div>
              </label>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

AgentTogglePanel.propTypes = {
  toggles: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      enabled: PropTypes.bool.isRequired,
      lastUpdated: PropTypes.string.isRequired,
    })
  ).isRequired,
};
