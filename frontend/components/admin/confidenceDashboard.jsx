// File: /frontend/components/admin/ConfidenceDashboard.jsx
// Purpose: Admin-facing summary dashboard for AI confidence scoring history

import axios from "axios";
import React, { useEffect, useState } from "react";

/**
 * ConfidenceDashboard.jsx
 *
 * Displays a table of recent confidence scores across AI agents.
 * Highlights threshold breaches and agent version metadata.
 * Pulls from GET /api/confidence/:fileId (via backend service or admin tools).
 */

export default function ConfidenceDashboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchScores = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("jwt");
      const res = await axios.get("/api/admin/metrics/system-health");
      const data = res.data;
      if (!data.success || !data.metrics?.recentConfidenceScores) {
        throw new Error("Missing or invalid score data.");
      }

      setScores(data.metrics.recentConfidenceScores);
      setError(null);
    } catch (err) {
      console.error("ConfidenceDashboard error:", err);
      setError("Failed to load confidence scores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
	  let isMounted = true;
	  
	  const runFetch = async () => {
		  if (isMounted) await fetchScores();
	  };
	  
	  runFetch();
	  
	  return () => {
		  isMounted = false;
	  };
  }, []);

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 Confidence Score Summary</h2>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && scores.length === 0 && (
        <p className="text-sm text-gray-500">No scores recorded yet.</p>
      )}

      {!loading && scores.length > 0 && (
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs uppercase text-gray-500 border-b">
            <tr>
              <th className="py-2 pr-4">File ID</th>
              <th className="py-2 pr-4">Score</th>
              <th className="py-2 pr-4">Threshold</th>
              <th className="py-2 pr-4">Version</th>
              <th className="py-2 pr-4">Flagged</th>
              <th className="py-2 pr-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="py-2 pr-4 text-xs text-blue-900 truncate">{s.fileId}</td>
                <td className="py-2 pr-4">{s.score.toFixed(2)}</td>
                <td className="py-2 pr-4">0.75</td>
                <td className="py-2 pr-4 text-xs">{s.agentVersion}</td>
                <td className="py-2 pr-4">
                  {s.thresholdBreached ? (
                    <span className="text-red-600 font-semibold">⚠️ Yes</span>
                  ) : (
                    <span className="text-green-600">No</span>
                  )}
                </td>
                <td className="py-2 pr-4">
                  {new Date(s.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
