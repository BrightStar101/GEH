// File: /frontend/pages/support/deleteMyData.jsx

import React, { useState, useEffect } from "react";
import { requestDataDeletion } from "../../services/legalDataService";
import { logger } from "../../utils/logger";
import { logoutUser } from "../../services/authService";

/**
 * deleteMyData.jsx
 * Allows authenticated users to submit a GDPR/CCPA-compliant data deletion request.
 * This action is irreversible and will remove form submissions, AI records, and uploaded files.
 *
 * Props:
 * - token: JWT auth token (required)
 */
export default function DeleteMyData({ token }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (status === "success") {
      setTimeout(() => {
        logoutUser();
      }, 3000); // Allow user to see success message for 3 seconds
    }
  }, [status]);

  const handleDelete = async () => {
    try {
      setStatus("loading");
      setError(null);

      const response = await requestDataDeletion(token);

      if (response?.success) {
        setStatus("success");
      } else {
        throw new Error("Deletion request failed");
      }
    } catch (err) {
      logger.error("DeleteMyData.handleDelete failed", err);
      setStatus("error");
      setError("There was a problem processing your request. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 px-4 py-6 border rounded-lg shadow-sm bg-white">
      <h1 className="text-lg font-semibold text-gray-800 mb-2">Delete My Data</h1>
      <p className="text-sm text-gray-600 mb-4">
        This will permanently delete your forms, uploaded files, and all AI-generated content.
        This action cannot be undone. You will be signed out automatically after the process completes.
      </p>

      <label className="inline-flex items-center mb-4 text-sm text-gray-700">
        <input
          type="checkbox"
          className="mr-2"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        I understand that this action is irreversible.
      </label>

      <button
        onClick={handleDelete}
        disabled={!confirmed || status === "loading" || status === "success"}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm disabled:opacity-60"
      >
        {status === "loading" ? "Deleting..." : "Delete My Data"}
      </button>

      {status === "success" && (
        <p className="mt-4 text-green-600 font-medium">
          ✅ Your deletion request has been received. You will be signed out shortly.
        </p>
      )}

      {status === "error" && (
        <p className="mt-4 text-red-600 font-medium">⚠️ {error}</p>
      )}
    </div>
  );
}
