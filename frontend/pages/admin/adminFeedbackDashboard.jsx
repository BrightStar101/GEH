import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

/**
 * AdminFeedbackDashboard.jsx
 * 
 * Admin-only page that displays user feedback from /api/feedback for CLA training
 * and quality review. Supports role-gated access, error fallback, and usage metrics.
 *
 * @returns JSX.Element
 */
export default function AdminFeedbackDashboard() {
  const [feedbackLogs, setFeedbackLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const token = localStorage.getItem("jwt");
    if (!token) return;

    const decoded = jwtDecode(token);
    if (decoded?.role !== "admin") return;

    async function fetchFeedbackLogs() {
      try {
        const res = await axios.get("/api/admin/feedback");
        const data = res.data;
        if (!data.success) throw new Error("Failed to load feedback logs");
        if (isMounted) setFeedbackLogs(data.entries);
      } catch (err) {
        console.error("Feedback dashboard fetch error:", err);
        if (isMounted) setError("Unable to load user feedback.");
      }
    }

    fetchFeedbackLogs();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">User Feedback (Mira)</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <table className="w-full text-sm border">
        <thead className="bg-slate-100 text-left">
          <tr>
            <th className="p-2">User ID</th>
            <th className="p-2">Score</th>
            <th className="p-2">Message</th>
            <th className="p-2">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {feedbackLogs.length === 0 && (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-500">No feedback available yet.</td>
            </tr>
          )}
          {feedbackLogs.map((entry, idx) => (
            <tr key={idx} className="border-t hover:bg-slate-50">
              <td className="p-2">{entry.userId}</td>
              <td className="p-2 font-semibold text-blue-700">{entry.score}</td>
              <td className="p-2">{entry.message || "—"}</td>
              <td className="p-2 text-sm text-gray-500">
                {new Date(entry.submittedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
