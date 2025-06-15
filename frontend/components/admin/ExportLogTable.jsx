// File: /frontend/components/admin/ExportLogTable.jsx
// Purpose: Displays recent admin export history from the exportAuditLogger

import axios from "axios";
import React, { useEffect, useState } from "react";

/**
 * ExportLogTable.jsx
 *
 * Admin-only component that displays recent export logs.
 * Shows type, admin, date, and filter metadata for each export event.
 * Provides read-only visibility into export actions for audit purposes.
 */

export default function ExportLogTable() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("jwt");
      const res = await axios.get("/api/admin/export/logs");
      const data = res.data;
      if (!data.success) throw new Error(data.error || "Failed to load logs.");
      setLogs(data.logs || []);
    } catch (err) {
      console.error("ExportLogTable fetch error:", err);
      setError("Could not load export history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">📚 Export History</h2>

      {loading && <p className="text-sm text-gray-500">Loading export logs...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && logs.length === 0 && (
        <p className="text-sm text-gray-500">No exports have been logged yet.</p>
      )}

      {!loading && logs.length > 0 && (
        <table className="w-full text-sm text-left text-gray-700 mt-2">
          <thead>
            <tr className="text-xs uppercase text-gray-500 border-b">
              <th className="py-2 pr-4">Admin</th>
              <th className="py-2 pr-4">Export Type</th>
              <th className="py-2 pr-4">Filters Used</th>
              <th className="py-2 pr-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="border-t">
                <td className="py-2 pr-4">{log.adminId?.email || "Unknown"}</td>
                <td className="py-2 pr-4 capitalize">{log.exportType}</td>
                <td className="py-2 pr-4 text-xs">
                  {Object.keys(log.filters || {}).length > 0
                    ? Object.entries(log.filters)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")
                    : "—"}
                </td>
                <td className="py-2 pr-4">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
