// File: /frontend/pages/admin/overridePanel.jsx

import React, { useContext, useState } from "react";
import AdminTopBar from "../../components/admin/AdminTopBar";
import { applyOverride } from "../../services/overrideControlService";
import { logger } from "../../utils/logger";
import { AuthContext } from "../../contexts/AuthContext";

/**
 * overridePanel.jsx
 * Allows an admin to override user state such as active agent, plan tier, or AI access duration.
 *
 * Props:
 * - token: JWT auth token (required)
 * - user: { name: string, role: string }
 */
export default function OverridePanel() {
  const [formData, setFormData] = useState({
    targetUserEmail: "",
    newPlan: "",
    newAgent: "",
    aiAccessHours: "",
  });

  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    setMessage(null);

    try {
      const response = await applyOverride(formData);
      setMessage("Override applied successfully.");
      setStatus("success");
    } catch (err) {
      logger.error("OverridePanel.handleSubmit failed", err);
      setStatus("error");
      setError("Failed to apply override. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Override User Plan or Agent</h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow-md rounded-md border">
          <div>
            <label className="block text-sm font-medium text-gray-700">Target User Email</label>
            <input
              type="text"
              name="targetUserEmail"
              value={formData.targetUserEmail}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">New Plan Tier</label>
            <select
              name="newPlan"
              value={formData.newPlan}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="">-- Select a Plan --</option>
              <option value="Free">Free</option>
              <option value="Starter">Starter</option>
              <option value="Official">Official</option>
              <option value="Family">Friends & Family</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">New Agent</label>
            <select
              name="newAgent"
              value={formData.newAgent}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="">-- Select an Agent --</option>
              <option value="Mira">Mira</option>
              <option value="Kairo">Kairo</option>
              <option value="Lumo">Lumo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Extend AI Access (hours)</label>
            <input
              type="number"
              name="aiAccessHours"
              min="0"
              value={formData.aiAccessHours}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            {status === "loading" ? "Applying..." : "Apply Override"}
          </button>

          {status === "success" && (
            <p className="text-sm text-green-600 mt-2">{message}</p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
