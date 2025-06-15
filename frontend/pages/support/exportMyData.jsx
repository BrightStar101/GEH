// File: /frontend/pages/support/exportMyData.jsx

import React, { useState } from "react";
import { requestDataExport } from "../../services/legalDataService";
import { logger } from "../../utils/logger";

/**
 * exportMyData.jsx
 * Allows a logged-in user to request a downloadable ZIP of their submitted data (PDFs, chats, etc.)
 * Complies with GDPR and CCPA requirements for data portability.
 *
 * Props:
 * - token: JWT auth token (required)
 */
export default function ExportMyData({ token }) {
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleExportRequest = async () => {
    try {
      setStatus("loading");
      setError(null);

      const response = await requestDataExport(token);

      if (response?.success && response?.downloadUrl) {
        setDownloadUrl(response.downloadUrl);
        setStatus("success");
      } else {
        throw new Error("Export failed or link missing");
      }
    } catch (err) {
      logger.error("ExportMyData.handleExportRequest failed", err);
      setStatus("error");
      setError("There was a problem generating your export. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 px-4 py-6 border rounded-lg shadow-sm bg-white">
      <h1 className="text-lg font-semibold text-gray-800 mb-2">Export My Data</h1>
      <p className="text-sm text-gray-600 mb-4">
        You can request a copy of your data (completed forms, AI interactions, uploaded files).
        The export will be compiled into a secure ZIP file and made available for download.
      </p>

      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-md disabled:opacity-50"
        onClick={handleExportRequest}
        disabled={status === "loading" || status === "success"}
      >
        {status === "loading" ? "Preparing..." : "Request Export"}
      </button>

      {status === "success" && downloadUrl && (
        <div className="mt-4">
          <p className="text-sm text-green-600 font-medium">
            ✅ Your export is ready.
          </p>
          <a
            href={downloadUrl}
            className="text-sm text-blue-700 underline mt-1 inline-block"
            download
          >
            Click here to download your data ZIP
          </a>
        </div>
      )}

      {status === "error" && (
        <p className="mt-4 text-sm text-red-500">⚠️ {error}</p>
      )}
    </div>
  );
}
