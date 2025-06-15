import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import moderationConfig from "../../config/moderationConfig";

/**
 * moderationPanel.jsx
 *
 * Admin UI to display flagged content with filtering by status and tag.
 * Now includes tier badge styling and tag-based filter control.
 */
export default function ModerationPanel() {
  const router = useRouter();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [tagFilter, setTagFilter] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchFlags() {
      setLoading(true);
      try {
        const res = await axios.get(`/api/moderation/flags?status=${statusFilter}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const allFlags = res.data.flags || [];
        const filtered = tagFilter
          ? allFlags.filter((f) =>
              f.matches.some((m) => m.tag.toLowerCase() === tagFilter.toLowerCase())
            )
          : allFlags;
        if (isMounted) setFlags(filtered);
      } catch (err) {
        if (isMounted) setError("Failed to load moderation queue.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchFlags();

    return () => {
      isMounted = false;
    };
  }, [statusFilter, tagFilter]);

  const handleRowClick = (flagId) => {
    router.push(`/admin/flagged/${flagId}`);
  };

  const renderTierBadge = (tier) => {
    const base = "px-2 py-1 rounded text-xs font-medium";
    const colorMap = {
      low: "bg-gray-100 text-gray-700",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-700",
    };
    return <span className={`${base} ${colorMap[tier] || ""}`}>{tier}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Moderation Panel</h1>

      <div className="mb-4 flex items-center space-x-4">
        <label htmlFor="status" className="text-sm font-medium text-gray-700">Status:</label>
        <select
          id="status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1 border rounded text-sm"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="removed">Removed</option>
          <option value="escalated">Escalated</option>
        </select>

        <label htmlFor="tag" className="text-sm font-medium text-gray-700">Tag:</label>
        <select
          id="tag"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="px-3 py-1 border rounded text-sm"
        >
          <option value="">All Tags</option>
          {moderationConfig.tags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500 italic">Loading moderation flags...</p>}
      {error && <p className="text-red-600 font-medium">{error}</p>}

      <div className="bg-white border rounded shadow mt-4">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Tag(s)</th>
              <th className="px-4 py-2">Tier</th>
              <th className="px-4 py-2">Source</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((flag) => (
              <tr
                key={flag.id}
                className="border-t hover:bg-blue-50 cursor-pointer"
                onClick={() => handleRowClick(flag.id)}
              >
                <td className="px-4 py-2 font-mono text-xs text-gray-700">{flag.id}</td>
                <td className="px-4 py-2">
                  {flag.matches.map((m) => m.tag).join(", ")}
                </td>
                <td className="px-4 py-2">{renderTierBadge(flag.highestTier)}</td>
                <td className="px-4 py-2">{flag.source}</td>
                <td className="px-4 py-2">{new Date(flag.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2">{flag.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
