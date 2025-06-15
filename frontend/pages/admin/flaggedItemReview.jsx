import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

/**
 * flaggedItemReview.jsx
 *
 * Displays a detailed view of a single moderation flag.
 * Supports reviewer actions (approve, remove, escalate).
 */
export default function FlaggedItemReview() {
  const router = useRouter();
  const { id } = router.query;

  const [flag, setFlag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    if (!id) return;

    async function fetchFlag() {
      setLoading(true);
      try {
        const res = await axios.get(`/api/moderation/flags/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (isMounted) setFlag(res.data.flag);
      } catch (err) {
        if (isMounted) setError("Failed to load flag details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchFlag();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAction = async (status) => {
    try {
      const res = await axios.post(
        `/api/moderation/moderate-action`,
        {
          flagId: id,
          newStatus: status,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setActionStatus(`Flag ${status} successfully.`);
      setFlag(res.data.data); // updated flag
    } catch (err) {
      setActionStatus("Action failed or not authorized.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Flag Detail</h1>

      {loading && <p className="text-gray-500 italic">Loading flagged content...</p>}
      {error && <p className="text-red-600 font-medium">{error}</p>}
      {actionStatus && <p className="text-blue-600 font-medium">{actionStatus}</p>}

      {flag && (
        <div className="bg-white border rounded shadow p-6 space-y-4">
          <div>
            <strong>Flag ID:</strong> {flag.id}
          </div>
          <div>
            <strong>Status:</strong> {flag.status}
          </div>
          <div>
            <strong>Tier:</strong>{" "}
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              flag.highestTier === "high"
                ? "bg-red-100 text-red-800"
                : flag.highestTier === "medium"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}>
              {flag.highestTier}
            </span>
          </div>
          <div>
            <strong>Source:</strong> {flag.source}
          </div>
          <div>
            <strong>Language:</strong> {flag.langCode}
          </div>
          <div>
            <strong>Original Text:</strong>
            <p className="mt-1 text-sm text-gray-700 border-l-4 pl-3 border-gray-300 italic">
              {flag.originalText}
            </p>
          </div>

          <div>
            <strong>Matches:</strong>
            <ul className="list-disc ml-5 text-sm text-gray-700">
              {flag.matches.map((match, i) => (
                <li key={i}>
                  <strong>Tag:</strong> {match.tag} | <strong>Confidence:</strong> {match.confidence} | <strong>Trace:</strong> {match.trace.join("; ")}
                </li>
              ))}
            </ul>
          </div>

          {flag.history?.length > 0 && (
            <div>
              <strong>Review History:</strong>
              <ul className="list-disc ml-5 text-sm text-gray-600">
                {flag.history.map((entry, idx) => (
                  <li key={idx}>
                    {entry.timestamp} — {entry.action} by {entry.by} ({entry.role})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4 space-x-4">
            <button
              onClick={() => handleAction("approved")}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={() => handleAction("removed")}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Remove
            </button>
            <button
              onClick={() => handleAction("escalated")}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Escalate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
