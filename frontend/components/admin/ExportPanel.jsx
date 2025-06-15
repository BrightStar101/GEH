// File: /frontend/components/admin/ExportPanel.jsx
// Purpose: Admin UI to configure and download platform export data (upgrade, moderation, usage)

import React, { useState } from "react";

/**
 * ExportPanel.jsx
 *
 * Admin-facing component for initiating CSV exports for:
 * - Upgrade Logs
 * - Moderation Decisions
 * - Usage Metrics
 * Includes optional from/to date filters and loading state.
 */

export default function ExportPanel() {
  const [exportType, setExportType] = useState("upgrade");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);

      const token = localStorage.getItem("jwt");
      const response = await fetch(`/api/admin/export/${exportType}?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Export failed. Please check filters or try again.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${exportType}-export.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ExportPanel download error:", err);
      setError(err.message || "Export failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-10">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">📤 Export Platform Data</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="exportType" className="text-sm font-medium text-gray-700">
            Export Type
          </label>
          <select
            id="exportType"
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="upgrade">Upgrade Logs</option>
            <option value="moderation">Moderation Actions</option>
            <option value="usage">Usage Metrics</option>
          </select>
        </div>

        <div>
          <label htmlFor="fromDate" className="text-sm font-medium text-gray-700">
            From Date
          </label>
          <input
            id="fromDate"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md text-sm shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="toDate" className="text-sm font-medium text-gray-700">
            To Date
          </label>
          <input
            id="toDate"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md text-sm shadow-sm"
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <button
        onClick={handleDownload}
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Exporting..." : "Download CSV"}
      </button>
    </div>
  );
}
