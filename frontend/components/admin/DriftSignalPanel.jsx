// File: /frontend/components/admin/DriftSignalPanel.jsx
// Purpose: Admin-only component for viewing recent AI drift flags

import axios from "axios";
import React, { useEffect, useState } from "react";

/**
 * DriftSignalPanel.jsx
 *
 * Displays a sortable table of drift signal flags.
 * Used to monitor model confidence degradation or outlier shifts.
 * Pulls from GET /api/confidence/drift.
 */

export default function DriftSignalPanel() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDriftSignals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("jwt");
      const res = await axios.get("/api/confidence/drift");
      const data = res.data;
      if (!data.success) throw new Error(data.error || "Failed to load drift data.");
      setSignals(data.signals || []);
    } catch (err) {
      console.error("DriftSignalPanel fetch error:", err);
      setError("Unable to retrieve drift signals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const runFetch = async () => {
      if (isMounted) await fetchDriftSignals();
    };

    runFetch();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">📉 AI Drift Alerts</h2>

      {loading && <p className="text-sm text-gray-500">Loading signals...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && signals.length === 0 && (
        <p className="text-sm text-gray-500">No drift flags in the past 30 days.</p>
      )}

      {!loading && signals.length > 0 && (
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs uppercase text-gray-500 border-b">
            <tr>
              <th className="py-2 pr-4">File ID</th>
              <th className="py-2 pr-4">Score</th>
              <th className="py-2 pr-4">Agent</th>
              <th className="py-2 pr-4">Signal</th>
              <th className="py-2 pr-4">Severity</th>
              <th className="py-2 pr-4">Time</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((sig) => (
              <tr key={sig._id} className="border-t">
                <td className="py-2 pr-4 text-xs truncate">{sig.fileId}</td>
                <td className="py-2 pr-4">{sig.score?.toFixed(2)}</td>
                <td className="py-2 pr-4 text-xs">{sig.agentVersion || "—"}</td>
                <td className="py-2 pr-4">{sig.signalType.replace("_", " ")}</td>
                <td className="py-2 pr-4">
                  <span
                    className={`text-xs font-medium ${sig.severity === "high"
                        ? "text-red-600"
                        : sig.severity === "medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                  >
                    {sig.severity.toUpperCase()}
                  </span>
                </td>
                <td className="py-2 pr-4">
                  {new Date(sig.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
